import { Injectable, Logger } from "@nestjs/common";
import type { AuthProviders, Me, UpdateMeInput } from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { ConfigService } from "../../config/config.service.js";
import { enabledSocialProviders } from "../../infrastructure/auth/create-auth.js";
import { FilesService, type UploadedFileData } from "../files/files.service.js";
import { toMe } from "./auth.mapper.js";
import { AuthRepository } from "./auth.repository.js";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly filesService: FilesService,
    private readonly config: ConfigService,
  ) {}

  async getMe(user: SessionUser): Promise<Me> {
    const row = await this.authRepository.findMe(user.id);
    if (!row) throw new AppException("UNAUTHORIZED");
    return toMe(row);
  }

  /**
   * Chỉ sửa tên, giới thiệu, ảnh của chính mình; vai trò, email, username không đổi ở đây.
   * Gửi `image` (link mới hoặc `null`) thì bỏ luôn ảnh đã tải lên, xóa file khỏi ổ đĩa.
   */
  async updateMe(user: SessionUser, input: UpdateMeInput): Promise<Me> {
    const changesImage = input.image !== undefined;
    const oldAvatarId = changesImage ? await this.authRepository.findAvatarId(user.id) : null;

    const row = await this.authRepository.updateMe(user.id, {
      name: input.name,
      bio: input.bio,
      image: input.image,
      ...(changesImage && { avatarId: null }),
    });
    if (oldAvatarId) await this.removeOldAvatar(oldAvatarId);
    return toMe(row);
  }

  /**
   * Đổi ảnh đại diện (docs/tinh-nang.md mục 1.4): lưu ảnh mới, gán vào hồ sơ, rồi xóa ảnh cũ khỏi ổ đĩa.
   * Gán lỗi thì xóa ảnh vừa lưu, không để file mồ côi.
   */
  async updateAvatar(user: SessionUser, file: UploadedFileData | undefined): Promise<Me> {
    const oldAvatarId = await this.authRepository.findAvatarId(user.id);
    const media = await this.filesService.uploadAvatar(user, file);

    let row;
    try {
      row = await this.authRepository.updateMe(user.id, { avatarId: media.id });
    } catch (error) {
      await this.filesService.remove(media.id);
      throw error;
    }
    if (oldAvatarId) await this.removeOldAvatar(oldAvatarId);
    return toMe(row);
  }

  providers(): AuthProviders {
    const social = enabledSocialProviders({
      GOOGLE_CLIENT_ID: this.config.get("GOOGLE_CLIENT_ID"),
      GOOGLE_CLIENT_SECRET: this.config.get("GOOGLE_CLIENT_SECRET"),
      GITHUB_CLIENT_ID: this.config.get("GITHUB_CLIENT_ID"),
      GITHUB_CLIENT_SECRET: this.config.get("GITHUB_CLIENT_SECRET"),
    });
    return { email: true, google: "google" in social, github: "github" in social };
  }

  /** Hồ sơ đã đổi xong; xóa ảnh cũ lỗi thì chỉ ghi log, không làm hỏng việc đổi ảnh. */
  private async removeOldAvatar(mediaId: string): Promise<void> {
    await this.filesService.remove(mediaId).catch((error: unknown) => {
      this.logger.warn(`Không xóa được ảnh đại diện cũ ${mediaId}: ${String(error)}`);
    });
  }
}
