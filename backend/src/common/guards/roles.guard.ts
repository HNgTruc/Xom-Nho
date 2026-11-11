import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@xom-nho/api";
import type { RequestWithUser } from "../decorators/current-user.decorator.js";
import { ROLES_KEY } from "../decorators/roles.decorator.js";
import { AppException } from "../exceptions/app-exception.js";

/** Chạy sau AuthGuard. Route có `@Roles(...)` chỉ cho đúng các vai trò đó; không có `@Roles` thì bỏ qua. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const user = context.switchToHttp().getRequest<RequestWithUser>().user;
    if (!user) throw new AppException("UNAUTHORIZED");
    if (!required.includes(user.role)) throw new AppException("FORBIDDEN");
    return true;
  }
}
