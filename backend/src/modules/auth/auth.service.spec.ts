import type { SessionUser } from "../../common/types/session-user.js";
import type { ConfigService } from "../../config/config.service.js";
import type { FilesService } from "../files/files.service.js";
import type { AuthRepository, MeRow } from "./auth.repository.js";
import { AuthService } from "./auth.service.js";

const lan = { id: "lan", role: "user", name: "Lan", email: "lan@test.local" } as SessionUser;
const file = { buffer: Buffer.from([1]), size: 1 };

function meRow(overrides: Partial<MeRow> = {}): MeRow {
  return {
    id: "lan",
    name: "Lan",
    email: "lan@test.local",
    username: "lan",
    image: null,
    avatarId: null,
    bio: null,
    role: "user",
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
    ...overrides,
  };
}

function setup(currentAvatarId: string | null) {
  const repository = {
    findAvatarId: vi.fn().mockResolvedValue(currentAvatarId),
    updateMe: vi
      .fn()
      .mockImplementation((_id: string, data: Partial<MeRow>) => Promise.resolve(meRow(data))),
  };
  const files = {
    uploadAvatar: vi.fn().mockResolvedValue({ id: "moi", kind: "IMAGE", mimeType: "image/png" }),
    remove: vi.fn().mockResolvedValue(undefined),
  };
  const service = new AuthService(
    repository as unknown as AuthRepository,
    files as unknown as FilesService,
    {} as ConfigService,
  );
  return { service, repository, files };
}

describe("AuthService.updateAvatar", () => {
  it("gán ảnh mới vào hồ sơ rồi xóa ảnh cũ", async () => {
    const { service, repository, files } = setup("cu");

    const me = await service.updateAvatar(lan, file);

    expect(files.uploadAvatar).toHaveBeenCalledWith(lan, file);
    expect(repository.updateMe).toHaveBeenCalledWith("lan", { avatarId: "moi" });
    expect(files.remove).toHaveBeenCalledWith("cu");
    expect(me.avatarId).toBe("moi");
  });

  it("chưa có ảnh thì không xóa gì", async () => {
    const { service, files } = setup(null);

    await service.updateAvatar(lan, file);

    expect(files.remove).not.toHaveBeenCalled();
  });

  it("gán vào hồ sơ lỗi thì xóa ảnh vừa tải, giữ ảnh cũ", async () => {
    const { service, repository, files } = setup("cu");
    repository.updateMe.mockRejectedValueOnce(new Error("db lỗi"));

    await expect(service.updateAvatar(lan, file)).rejects.toThrow("db lỗi");

    expect(files.remove).toHaveBeenCalledWith("moi");
    expect(files.remove).not.toHaveBeenCalledWith("cu");
  });

  it("xóa ảnh cũ lỗi vẫn đổi ảnh thành công", async () => {
    const { service, files } = setup("cu");
    files.remove.mockRejectedValueOnce(new Error("đĩa lỗi"));

    await expect(service.updateAvatar(lan, file)).resolves.toMatchObject({ avatarId: "moi" });
  });

  it("file sai loại thì không đụng tới hồ sơ", async () => {
    const { service, repository, files } = setup("cu");
    files.uploadAvatar.mockRejectedValueOnce(new Error("không phải ảnh"));

    await expect(service.updateAvatar(lan, file)).rejects.toThrow("không phải ảnh");

    expect(repository.updateMe).not.toHaveBeenCalled();
    expect(files.remove).not.toHaveBeenCalled();
  });
});

describe("AuthService.updateMe", () => {
  it("đổi ảnh bằng link (hay xóa ảnh) thì bỏ ảnh đã tải lên, xóa file", async () => {
    const { service, repository, files } = setup("cu");

    await service.updateMe(lan, { image: null });

    expect(repository.updateMe).toHaveBeenCalledWith("lan", {
      name: undefined,
      bio: undefined,
      image: null,
      avatarId: null,
    });
    expect(files.remove).toHaveBeenCalledWith("cu");
  });

  it("chỉ sửa tên thì giữ nguyên ảnh đại diện", async () => {
    const { service, repository, files } = setup("cu");

    await service.updateMe(lan, { name: "Lan Anh" });

    expect(repository.findAvatarId).not.toHaveBeenCalled();
    expect(repository.updateMe.mock.calls[0]?.[1]).not.toHaveProperty("avatarId");
    expect(files.remove).not.toHaveBeenCalled();
  });
});
