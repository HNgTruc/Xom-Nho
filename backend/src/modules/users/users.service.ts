import { Injectable } from "@nestjs/common";
import {
  ADMIN_MESSAGES,
  type AdminListUsersQuery,
  type AdminUserListItem,
  type BanUserInput,
  pathIdSchema,
  pathUsernameSchema,
  POST_STATUSES,
  type PublicProfile,
  type SetUserRoleInput,
} from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import { paginate, type Paginated } from "../../common/types/paginated.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { toAdminUserListItem, toPublicProfile, toRole } from "./users.mapper.js";
import { UsersPolicy } from "./users.policy.js";
import { type AdminUserRow, UsersRepository } from "./users.repository.js";

const USER_NOT_FOUND = "Không tìm thấy hàng xóm này. Bạn kiểm tra lại đường dẫn nhé.";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Hồ sơ công khai theo username, ai cũng xem được. Người bị cấm vẫn có hồ sơ (bài cũ của họ vẫn hiện),
   * nhưng hồ sơ không cho biết ai bị cấm. Username sai dạng (kể cả viết hoa) coi là không có.
   */
  async getProfile(username: string): Promise<PublicProfile> {
    if (!pathUsernameSchema.safeParse(username).success) {
      throw new AppException("NOT_FOUND", USER_NOT_FOUND);
    }
    const row = await this.usersRepository.findProfile(username, POST_STATUSES.PUBLISHED);
    if (!row) throw new AppException("NOT_FOUND", USER_NOT_FOUND);
    return toPublicProfile(row);
  }

  // ===== Quản trị (`users.admin.controller.ts`, chỉ trưởng xóm: `@Roles("admin")`) =====

  /** Bảng thành viên: tìm theo tên, email; lọc vai trò, đang bị cấm. */
  async adminList(query: AdminListUsersQuery): Promise<Paginated<AdminUserListItem>> {
    const { page, pageSize, role, banned, q } = query;
    const now = new Date();
    const [rows, total] = await this.usersRepository.findAdminList(
      { role, banned, nameOrEmail: q, now },
      { skip: (page - 1) * pageSize, take: pageSize },
    );
    return paginate(
      rows.map((row) => toAdminUserListItem(row, now)),
      total,
      page,
      pageSize,
    );
  }

  /** Đổi vai trò. Không tự đổi của mình (FORBIDDEN). Có hiệu lực ngay ở request sau (phiên đọc lại `user`). */
  async setRole(
    admin: SessionUser,
    id: string,
    input: SetUserRoleInput,
  ): Promise<AdminUserListItem> {
    const target = await this.findTarget(id);
    if (!UsersPolicy.canChangeRole(admin, { id: target.id, role: toRole(target.role) })) {
      throw new AppException("FORBIDDEN", ADMIN_MESSAGES.CANNOT_CHANGE_OWN_ROLE);
    }
    return toAdminUserListItem(await this.usersRepository.updateRole(id, input.role));
  }

  /**
   * Cấm thành viên, lý do bắt buộc; `expiresAt` bỏ trống là vĩnh viễn. Không tự cấm mình, không cấm trưởng
   * xóm khác (FORBIDDEN). Hạn cấm kiểm tra lại theo đồng hồ server. Người bị cấm bị đăng xuất ngay.
   */
  async ban(admin: SessionUser, id: string, input: BanUserInput): Promise<AdminUserListItem> {
    const target = await this.findTarget(id);
    if (!UsersPolicy.canBan(admin, { id: target.id, role: toRole(target.role) })) {
      const message =
        admin.id === target.id ? ADMIN_MESSAGES.CANNOT_BAN_SELF : ADMIN_MESSAGES.CANNOT_BAN_ADMIN;
      throw new AppException("FORBIDDEN", message);
    }

    const expires = input.expiresAt ? new Date(input.expiresAt) : null;
    if (expires && expires.getTime() <= Date.now()) {
      throw new AppException("VALIDATION_ERROR", ADMIN_MESSAGES.BAN_EXPIRES_PAST, {
        expiresAt: ADMIN_MESSAGES.BAN_EXPIRES_PAST,
      });
    }
    return toAdminUserListItem(await this.usersRepository.ban(id, input.reason, expires));
  }

  /** Bỏ cấm. Không bị cấm thì giữ nguyên (gọi lặp lại không lỗi). */
  async unban(id: string): Promise<AdminUserListItem> {
    await this.findTarget(id);
    return toAdminUserListItem(await this.usersRepository.unban(id));
  }

  /** Thành viên theo id cho route admin. Không có hoặc id sai dạng: NOT_FOUND. */
  private async findTarget(id: string): Promise<AdminUserRow> {
    const row = pathIdSchema.safeParse(id).success
      ? await this.usersRepository.findAdminRow(id)
      : null;
    if (!row) throw new AppException("NOT_FOUND", ADMIN_MESSAGES.USER_NOT_FOUND);
    return row;
  }
}
