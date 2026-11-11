import { Body, Controller, Get, Patch } from "@nestjs/common";
import { type AuthProviders, type Me, type UpdateMeInput, updateMeSchema } from "@xom-nho/api";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { SessionUser } from "../../common/types/session-user.js";
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

  @Public()
  @Get("auth/providers")
  providers(): AuthProviders {
    return this.authService.providers();
  }
}
