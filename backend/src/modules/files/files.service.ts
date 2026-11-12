import { Injectable, Logger } from "@nestjs/common";
import { FILE_MESSAGES, LIMITS, type MediaItem, type MediaKind, pathIdSchema } from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import {
  type StorageFolder,
  StorageService,
} from "../../infrastructure/storage/storage.service.js";
import { detectFileType } from "./file-signature.js";
import { FilesPolicy } from "./files.policy.js";
import { FilesRepository, type MediaItemRow } from "./files.repository.js";

/** File multer giữ trong bộ nhớ (chỉ phần service cần, khỏi phụ thuộc `@types/multer`). */
export interface UploadedFileData {
  buffer: Buffer;
  size: number;
}

const MAX_BYTES: Record<MediaKind, number> = {
  IMAGE: LIMITS.IMAGE_MAX_BYTES,
  VIDEO: LIMITS.VIDEO_MAX_BYTES,
};

const TOO_LARGE_MESSAGE: Record<MediaKind, string> = {
  IMAGE: FILE_MESSAGES.IMAGE_TOO_LARGE,
  VIDEO: FILE_MESSAGES.VIDEO_TOO_LARGE,
};

/** Ảnh, video trong bài nằm ở `media/images`, `media/videos`. */
const FOLDER: Record<MediaKind, StorageFolder> = {
  IMAGE: "images",
  VIDEO: "videos",
};

/** 30 file mỗi 10 phút mỗi người: đủ cho vài bài 10 ảnh, chặn ai đó đổ đầy ổ đĩa. */
const UPLOAD_RATE = { limit: 30, windowMs: 10 * 60 * 1000, message: FILE_MESSAGES.RATE_LIMITED };

/** File tải lên mà quá 1 ngày chưa gắn bài thì là rác: không ai viết dở một bài lâu đến thế. */
export const ORPHAN_MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** Mỗi lần dọn xóa tối đa 10 lô x 100 file, còn thừa thì để lần sau: không giữ database lâu. */
const CLEANUP_BATCH_SIZE = 100;
const CLEANUP_MAX_BATCHES = 10;

export function toMediaItem(row: MediaItemRow): MediaItem {
  return { id: row.id, kind: row.kind, mimeType: row.mimeType };
}

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly storage: StorageService,
    private readonly rateLimiter: RateLimiter,
  ) {}

  /**
   * Nhận một ảnh hoặc video (ADR 0005): loại file theo chữ ký nhị phân, cỡ theo loại, rồi lưu đĩa và database.
   * File chưa gắn bài nào; `POST /posts` gắn sau qua `mediaIds`.
   */
  upload(user: SessionUser, file: UploadedFileData | undefined): Promise<MediaItem> {
    return this.store(user, file, "POST");
  }

  /**
   * Nhận ảnh đại diện: chỉ ảnh (JPG, PNG, WebP đến 5 MB), lưu ở `media/avatars`. Chưa gán cho ai;
   * `AuthService.updateAvatar` gán vào hồ sơ rồi xóa ảnh cũ.
   */
  uploadAvatar(user: SessionUser, file: UploadedFileData | undefined): Promise<MediaItem> {
    return this.store(user, file, "AVATAR");
  }

  /** Xóa dòng media và file trên đĩa. Xóa file lỗi thì chỉ ghi log: dòng đã mất, file thành rác vô hại. */
  async remove(id: string): Promise<void> {
    const storageKey = await this.filesRepository.delete(id);
    if (storageKey) await this.removeFile(storageKey);
  }

  /**
   * Dọn file rác (docs/co-so-du-lieu.md, ADR 0005): ảnh, video tải lên cho bài mà quá `ORPHAN_MAX_AGE_MS` chưa gắn
   * bài nào (bỏ dở hộp soạn, gỡ khỏi hộp trước khi đăng). Không đụng ảnh đại diện. `FilesScheduler` gọi mỗi giờ.
   * Xóa dòng trước, rồi chỉ xóa trên đĩa file đã xóa dòng thật: file vừa được gắn bài giữa chừng thì giữ nguyên.
   * Trả số file đã dọn.
   */
  async cleanupOrphans(now: Date = new Date()): Promise<number> {
    const before = new Date(now.getTime() - ORPHAN_MAX_AGE_MS);
    let removed = 0;
    for (let batch = 0; batch < CLEANUP_MAX_BATCHES; batch++) {
      const candidates = await this.filesRepository.findOrphans(before, CLEANUP_BATCH_SIZE);
      if (candidates.length === 0) break;

      const deleted = new Set(
        await this.filesRepository.deleteOrphans(
          candidates.map((row) => row.id),
          before,
        ),
      );
      for (const row of candidates) {
        if (deleted.has(row.id)) await this.removeFile(row.storageKey);
      }
      removed += deleted.size;
      if (candidates.length < CLEANUP_BATCH_SIZE) break;
    }
    if (removed > 0) this.logger.log(`Đã dọn ${removed} file tải lên mà không gắn bài`);
    return removed;
  }

  private async store(
    user: SessionUser,
    file: UploadedFileData | undefined,
    purpose: "POST" | "AVATAR",
  ): Promise<MediaItem> {
    if (!file || file.size === 0) {
      throw new AppException("VALIDATION_ERROR", FILE_MESSAGES.MISSING, {
        file: FILE_MESSAGES.MISSING,
      });
    }
    const type = detectFileType(file.buffer.subarray(0, 64));
    if (!type) {
      throw new AppException("VALIDATION_ERROR", FILE_MESSAGES.UNSUPPORTED, {
        file: FILE_MESSAGES.UNSUPPORTED,
      });
    }
    if (purpose === "AVATAR" && type.kind !== "IMAGE") {
      throw new AppException("VALIDATION_ERROR", FILE_MESSAGES.AVATAR_NOT_IMAGE, {
        file: FILE_MESSAGES.AVATAR_NOT_IMAGE,
      });
    }
    if (file.size > MAX_BYTES[type.kind]) {
      const message = TOO_LARGE_MESSAGE[type.kind];
      throw new AppException("VALIDATION_ERROR", message, { file: message });
    }
    this.rateLimiter.consume(`upload:${user.id}`, UPLOAD_RATE);

    const folder = purpose === "AVATAR" ? "avatars" : FOLDER[type.kind];
    const storageKey = await this.storage.save(file.buffer, type.extension, folder);
    try {
      const row = await this.filesRepository.create({
        kind: type.kind,
        purpose,
        mimeType: type.mimeType,
        sizeBytes: file.size,
        storageKey,
        ownerId: user.id,
      });
      return toMediaItem(row);
    } catch (error) {
      // Không để file mồ côi trên đĩa khi ghi database lỗi
      await this.removeFile(storageKey);
      throw error;
    }
  }

  private async removeFile(storageKey: string): Promise<void> {
    await this.storage.remove(storageKey).catch((error: unknown) => {
      this.logger.warn(`Không xóa được file ${storageKey}: ${String(error)}`);
    });
  }

  /**
   * File để gửi về trình duyệt. Không có, hoặc không được xem, đều là NOT_FOUND (không lộ file có tồn tại).
   */
  async open(user: SessionUser, id: string): Promise<{ path: string; mimeType: string }> {
    if (!pathIdSchema.safeParse(id).success) {
      throw new AppException("NOT_FOUND", FILE_MESSAGES.NOT_FOUND);
    }
    const row = await this.filesRepository.findForAccess(id);
    if (!row || !FilesPolicy.canView(user, row)) {
      throw new AppException("NOT_FOUND", FILE_MESSAGES.NOT_FOUND);
    }
    return { path: this.storage.pathFor(row.storageKey), mimeType: row.mimeType };
  }
}
