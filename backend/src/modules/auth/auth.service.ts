import { Injectable } from "@nestjs/common";
import type { AuthProviders, Me, UpdateMeInput } from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { ConfigService } from "../../config/config.service.js";
import { enabledSocialProviders } from "../../infrastructure/auth/create-auth.js";
import { toMe } from "./auth.mapper.js";
import { AuthRepository } from "./auth.repository.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly config: ConfigService,
  ) {}

  async getMe(user: SessionUser): Promise<Me> {
    const row = await this.authRepository.findMe(user.id);
    if (!row) throw new AppException("UNAUTHORIZED");
    return toMe(row);
  }

  /** Chỉ sửa tên, giới thiệu, ảnh của chính mình; vai trò, email, username không đổi ở đây. */
  async updateMe(user: SessionUser, input: UpdateMeInput): Promise<Me> {
    const row = await this.authRepository.updateMe(user.id, {
      name: input.name,
      bio: input.bio,
      image: input.image,
    });
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
}
