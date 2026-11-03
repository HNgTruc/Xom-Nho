import type { ProfileRow, UsersRepository } from "./users.repository.js";
import { UsersService } from "./users.service.js";

function profileRow(overrides: Partial<ProfileRow> = {}): ProfileRow {
  return {
    id: "u1",
    name: "Lan Anh",
    username: "lananh",
    image: null,
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
