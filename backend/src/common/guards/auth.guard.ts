import { type CanActivate, type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { fromNodeHeaders } from "better-auth/node";
import { AUTH } from "../../infrastructure/auth/auth.module.js";
import type { Auth } from "../../infrastructure/auth/create-auth.js";
import {
  type AuthUserRecord,
  bannedMessage,
  toSessionUser,
} from "../../infrastructure/auth/session-user.js";
import type { RequestWithUser } from "../decorators/current-user.decorator.js";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import { AppException } from "../exceptions/app-exception.js";

/**
 * Guard toàn cục: lấy phiên Better Auth từ cookie (web, admin) hoặc header Cookie (app), gắn `request.user`.
 * Mặc định mọi route cần đăng nhập; route `@Public()` vẫn nhận `user` nếu có phiên.
 * Người bị cấm bị coi như khách ở route công khai và nhận 403 ở route cần đăng nhập.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH) private readonly auth: Pick<Auth, "api">,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "http") return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const result = await this.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    const authUser = result?.user as AuthUserRecord | undefined;

    if (authUser) {
      const user = toSessionUser(authUser);
      if (!user.banned) request.user = user;
      else if (!isPublic) throw new AppException("FORBIDDEN", bannedMessage(authUser));
    }

    if (!request.user && !isPublic) throw new AppException("UNAUTHORIZED");
    return true;
  }
}
