import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { SessionUser } from "../types/session-user.js";

export type RequestWithUser = Request & { user?: SessionUser };

/** Người đang đăng nhập. Route `@Public()` nhận `undefined` khi khách gọi. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser | undefined =>
    context.switchToHttp().getRequest<RequestWithUser>().user,
);
