import { SetMetadata } from "@nestjs/common";
import type { Role } from "@xom-nho/shared";

export const ROLES_KEY = "roles";

/** Vai trò được gọi route, `RolesGuard` kiểm tra. Mọi `*.admin.controller.ts` gắn `@Roles("admin")` ở cấp class. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
