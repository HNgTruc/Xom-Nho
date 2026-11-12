import { Body, Controller, Get, Patch, Put, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  type AuthProviders,
  LIMITS,
  type Me,
  type UpdateMeInput,
  updateMeSchema,
} from "@xom-nho/api";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { SessionUser } from "../../common/types/session-user.js";
import type { UploadedFileData } from "../files/files.service.js";
import { AuthService } from "./auth.service.js";

/** Đăng ký, đăng nhập, đăng xuất nằm ở Better Auth (/api/auth/*). Đây chỉ là phần của Xóm Nhỏ. */
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  getMe(@CurrentUser() user: SessionUser): Promise<Me> {
    return this.authService.getMe(user);
  }

  @Patch("me")
  updateMe(
    @CurrentUser() user: SessionUser,
    @Body(new ZodValidationPipe(updateMeSchema)) input: UpdateMeInput,
  ): Promise<Me> {
    return this.authService.updateMe(user, input);
  }

  /**
   * Đổi ảnh đại diện, multipart trường `file`. Multer chặn từ 25 MB như `POST /files` (413); ảnh quá 5 MB
   * hay file không phải ảnh do service báo lỗi tiếng Việt (400).
   */
  @Put("me/avatar")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: LIMITS.VIDEO_MAX_BYTES, files: 1, fields: 0 } }),
  )
  updateAvatar(
    @CurrentUser() user: SessionUser,
    @UploadedFile() file: UploadedFileData | undefined,
  ): Promise<Me> {
    return this.authService.updateAvatar(user, file);
  }

  @Public()
  @Get("auth/providers")
  providers(): AuthProviders {
    return this.authService.providers();
  }
}
