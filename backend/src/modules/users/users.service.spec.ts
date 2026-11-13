import { ADMIN_MESSAGES } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";
import type { AdminUserRow, ProfileRow, UsersRepository } from "./users.repository.js";
import { UsersService } from "./users.service.js";

function profileRow(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    id: "u1",
    name: "Lan Anh",
    username: "lananh",
    image: null,
    avatarId: null,
    bio: "Thích nấu ăn",
    role: "author",
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
    _count: { posts: 4 },
    ...overrides,
  };
}

function setup(row: ProfileRow | null = profileRow()) {
  const repository = { findProfile: vi.fn().mockResolvedValue(row) };
  const service = new UsersService(repository as unknown as UsersRepository);
  return { service, repository };
}

describe("UsersService.getProfile", () => {
  it("trả hồ sơ công khai, số bài chỉ đếm bài đã đăng", async () => {
    const { service, repository } = setup();

    const profile = await service.getProfile("lananh");

    expect(repository.findProfile).toHaveBeenCalledWith("lananh", "PUBLISHED");
    expect(profile).toEqual({
      id: "u1",
      name: "Lan Anh",
      username: "lananh",
      image: null,
      avatarId: null,
      bio: "Thích nấu ăn",
      role: "author",
      createdAt: "2026-10-01T00:00:00.000Z",
      postCount: 4,
    });
  });

  it("không trả trường thừa dù repository có lấy (email, banned)", async () => {
    const { service } = setup({ ...profileRow(), email: "lan@x.vn", banned: true } as ProfileRow);

    const profile = await service.getProfile("lananh");

    expect(profile).not.toHaveProperty("email");
    expect(profile).not.toHaveProperty("banned");
  });

  it("vai trò lạ trong database thì coi như hàng xóm thường", async () => {
    const { service } = setup(profileRow({ role: "superuser" }));

    await expect(service.getProfile("lananh")).resolves.toMatchObject({ role: "user" });
  });

  it("không có thì NOT_FOUND", async () => {
    const { service } = setup(null);

    await expect(service.getProfile("khongco")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it.each(["LanAnh", "lan-anh", "a".repeat(21)])(
    "username %j sai dạng thì NOT_FOUND, không truy vấn",
    async (username) => {
      const { service, repository } = setup();

      await expect(service.getProfile(username)).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(repository.findProfile).not.toHaveBeenCalled();
    },
  );
});

describe("UsersService (route admin)", () => {
  const admin: SessionUser = {
    id: "admin-1",
    name: "Trưởng Xóm",
    email: "truongxom@x.vn",
    username: "truongxom",
    role: "admin",
    banned: false,
  };
  const DAY = 24 * 60 * 60 * 1000;

  function adminRow(overrides: Partial<AdminUserRow> = {}): AdminUserRow {
    return {
      id: "u1",
      name: "Lan Anh",
      email: "lan@x.vn",
      username: "lananh",
      image: null,
      avatarId: null,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date("2026-10-01T00:00:00.000Z"),
      _count: { posts: 3, comments: 7 },
      ...overrides,
    };
  }

  function adminSetup(target: AdminUserRow | null = adminRow()) {
    const repository = {
      findAdminList: vi.fn().mockResolvedValue([target ? [target] : [], target ? 1 : 0]),
      findAdminRow: vi.fn().mockResolvedValue(target),
      updateRole: vi
        .fn()
        .mockImplementation((_id: string, role: string) =>
          Promise.resolve(adminRow({ ...target, role })),
        ),
      ban: vi
        .fn()
        .mockImplementation((_id: string, banReason: string, banExpires: Date | null) =>
          Promise.resolve(adminRow({ ...target, banned: true, banReason, banExpires })),
        ),
      unban: vi.fn().mockResolvedValue(adminRow({ ...target, banned: false })),
    };
    const service = new UsersService(repository as unknown as UsersRepository);
    return { service, repository };
  }

  it("adminList: có email, số bài, số bình luận; truyền bộ lọc", async () => {
    const { service, repository } = adminSetup();

    const result = await service.adminList({ page: 1, pageSize: 20, banned: true, q: "lan" });

    expect(repository.findAdminList).toHaveBeenCalledWith(
      expect.objectContaining({ banned: true, nameOrEmail: "lan", role: undefined }),
      { skip: 0, take: 20 },
    );
    expect(result.items[0]).toMatchObject({ email: "lan@x.vn", postCount: 3, commentCount: 7 });
  });

  it("cấm đã hết hạn thì coi như không bị cấm, không trả lý do cũ", async () => {
    const expired = adminRow({
      banned: true,
      banReason: "Spam",
      banExpires: new Date(Date.now() - DAY),
    });
    const { service } = adminSetup(expired);

    const [item] = (await service.adminList({ page: 1, pageSize: 20 })).items;

    expect(item).toMatchObject({ banned: false, banReason: null, banExpires: null });
  });

  it("đổi vai trò người khác", async () => {
    const { service, repository } = adminSetup();

    const item = await service.setRole(admin, "u1", { role: "author" });

    expect(repository.updateRole).toHaveBeenCalledWith("u1", "author");
    expect(item.role).toBe("author");
  });

  it("hạ vai trò trưởng xóm khác được", async () => {
    const { service } = adminSetup(adminRow({ id: "admin-2", role: "admin" }));
    await expect(service.setRole(admin, "admin-2", { role: "user" })).resolves.toMatchObject({
      role: "user",
    });
  });

  it("không tự đổi vai trò của mình", async () => {
    const { service, repository } = adminSetup(adminRow({ id: admin.id, role: "admin" }));

    await expect(service.setRole(admin, admin.id, { role: "user" })).rejects.toMatchObject({
      code: "FORBIDDEN",
      message: ADMIN_MESSAGES.CANNOT_CHANGE_OWN_ROLE,
    });
    expect(repository.updateRole).not.toHaveBeenCalled();
  });

  it("cấm có hạn: lưu lý do và hạn", async () => {
    const { service, repository } = adminSetup();
    const expiresAt = new Date(Date.now() + 7 * DAY).toISOString();

    const item = await service.ban(admin, "u1", { reason: "Spam", expiresAt });

    expect(repository.ban).toHaveBeenCalledWith("u1", "Spam", new Date(expiresAt));
    expect(item).toMatchObject({ banned: true, banReason: "Spam", banExpires: expiresAt });
  });

  it("cấm không hạn là vĩnh viễn", async () => {
    const { service, repository } = adminSetup();

    await service.ban(admin, "u1", { reason: "Spam" });

    expect(repository.ban).toHaveBeenCalledWith("u1", "Spam", null);
  });

  it("hạn cấm đã qua theo đồng hồ server thì VALIDATION_ERROR", async () => {
    const { service, repository } = adminSetup();
    const expiresAt = new Date(Date.now() - 1000).toISOString();

    await expect(service.ban(admin, "u1", { reason: "Spam", expiresAt })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: ADMIN_MESSAGES.BAN_EXPIRES_PAST,
    });
    expect(repository.ban).not.toHaveBeenCalled();
  });

  it.each([
    ["chính mình", adminRow({ id: admin.id, role: "admin" }), ADMIN_MESSAGES.CANNOT_BAN_SELF],
    [
      "trưởng xóm khác",
      adminRow({ id: "admin-2", role: "admin" }),
      ADMIN_MESSAGES.CANNOT_BAN_ADMIN,
    ],
  ])("không cấm được %s", async (_label, target, message) => {
    const { service, repository } = adminSetup(target);

    await expect(service.ban(admin, target.id, { reason: "Spam" })).rejects.toMatchObject({
      code: "FORBIDDEN",
      message,
    });
    expect(repository.ban).not.toHaveBeenCalled();
  });

  it("bỏ cấm", async () => {
    const { service, repository } = adminSetup(adminRow({ banned: true, banReason: "Spam" }));

    expect((await service.unban("u1")).banned).toBe(false);
    expect(repository.unban).toHaveBeenCalledWith("u1");
  });

  it.each(["khong-co", "../u1"])("thành viên %j không có thì NOT_FOUND", async (id) => {
    const { service } = adminSetup(null);
    const notFound = { code: "NOT_FOUND", message: ADMIN_MESSAGES.USER_NOT_FOUND };

    await expect(service.setRole(admin, id, { role: "user" })).rejects.toMatchObject(notFound);
    await expect(service.ban(admin, id, { reason: "Spam" })).rejects.toMatchObject(notFound);
    await expect(service.unban(id)).rejects.toMatchObject(notFound);
  });
});
