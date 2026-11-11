import { Injectable, Logger } from "@nestjs/common";
import { FILE_MESSAGES, LIMITS, type MediaItem, type MediaKind, pathIdSchema } from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import { StorageService } from "../../infrastructure/storage/storage.service.js";
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

/** 30 file mỗi 10 phút mỗi người: đủ cho vài bài 10 ảnh, chặn ai đó đổ đầy ổ đĩa. */
const UPLOAD_RATE = { limit: 30, windowMs: 10 * 60 * 1000, message: FILE_MESSAGES.RATE_LIMITED };

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
  async upload(user: SessionUser, file: UploadedFileData | undefined): Promise<MediaItem> {
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
    if (file.size > MAX_BYTES[type.kind]) {
      const message = TOO_LARGE_MESSAGE[type.kind];
      throw new AppException("VALIDATION_ERROR", message, { file: message });
    }
    this.rateLimiter.consume(`upload:${user.id}`, UPLOAD_RATE);

    const storageKey = await this.storage.save(file.buffer, type.extension);
    try {
      const row = await this.filesRepository.create({
        kind: type.kind,
        mimeType: type.mimeType,
        sizeBytes: file.size,
        storageKey,
        ownerId: user.id,
      });
      return toMediaItem(row);
    } catch (error) {
      // Không để file mồ côi trên đĩa khi ghi database lỗi
      await this.storage.remove(storageKey).catch((removeError: unknown) => {
        this.logger.warn(`Không xóa được file ${storageKey}: ${String(removeError)}`);
      });
      throw error;
    }
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
