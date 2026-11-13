import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  type AdminListUsersQuery,
  adminListUsersQuerySchema,
  type AdminUserListItem,
  type BanUserInput,
  banUserSchema,
  ROLES,
  type SetUserRoleInput,
  setUserRoleSchema,
} from "@xom-nho/api";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { UsersService } from "./users.service.js";

/**
 * Thành viên trong trang quản trị (docs/api.md mục "Quản trị", docs/tinh-nang.md mục 4.5). Ghi thẳng cột của
 * plugin admin Better Auth qua repository (không gọi `auth.api.banUser`, để service không cần header phiên).
 */
@Controller("admin/users")
@Roles(ROLES.ADMIN)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(adminListUsersQuerySchema)) query: AdminListUsersQuery,
  ): Promise<Paginated<AdminUserListItem>> {
    return this.usersService.adminList(query);
  }

  @Patch(":id/role")
  setRole(
    @CurrentUser() admin: SessionUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(setUserRoleSchema)) input: SetUserRoleInput,
  ): Promise<AdminUserListItem> {
    return this.usersService.setRole(admin, id, input);
  }

  @Post(":id/ban")
  @HttpCode(HttpStatus.OK)
  ban(
    @CurrentUser() admin: SessionUser,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(banUserSchema)) input: BanUserInput,
  ): Promise<AdminUserListItem> {
    return this.usersService.ban(admin, id, input);
  }

  @Post(":id/unban")
  @HttpCode(HttpStatus.OK)
  unban(@Param("id") id: string): Promise<AdminUserListItem> {
    return this.usersService.unban(id);
  }
}
