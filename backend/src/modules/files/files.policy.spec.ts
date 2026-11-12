import type { SessionUser } from "../../common/types/session-user.js";
import { FilesPolicy } from "./files.policy.js";

const user = (id: string, role = "user"): SessionUser =>
  ({ id, role, banned: false, name: id, email: `${id}@test.local` }) as SessionUser;

describe("FilesPolicy.canView", () => {
  const published = {
    ownerId: "lan",
    purpose: "POST" as const,
    post: { status: "PUBLISHED" as const },
  };
  const unattached = { ownerId: "lan", purpose: "POST" as const, post: null };
  const archived = {
    ownerId: "lan",
    purpose: "POST" as const,
    post: { status: "ARCHIVED" as const },
  };
  const avatar = { ownerId: "lan", purpose: "AVATAR" as const, post: null };

  it.each(["user", "author", "admin"])("file trong bài đã đăng: %s nào cũng xem được", (role) => {
    expect(FilesPolicy.canView(user("minh", role), published)).toBe(true);
  });

  it("file chưa gắn bài: chỉ người tải lên xem", () => {
    expect(FilesPolicy.canView(user("lan"), unattached)).toBe(true);
    expect(FilesPolicy.canView(user("minh"), unattached)).toBe(false);
    expect(FilesPolicy.canView(user("minh", "author"), unattached)).toBe(false);
  });

  it("trưởng xóm xem được file chưa gắn bài và file của bài đã ẩn", () => {
    expect(FilesPolicy.canView(user("admin1", "admin"), unattached)).toBe(true);
    expect(FilesPolicy.canView(user("admin1", "admin"), archived)).toBe(true);
  });

  it("bài đã ẩn: hàng xóm khác không xem được, chủ bài vẫn xem", () => {
    expect(FilesPolicy.canView(user("minh"), archived)).toBe(false);
    expect(FilesPolicy.canView(user("lan"), archived)).toBe(true);
  });

  it.each(["user", "author", "admin"])(
    "ảnh đại diện của người khác: %s nào cũng xem được",
    (role) => {
      expect(FilesPolicy.canView(user("minh", role), avatar)).toBe(true);
    },
  );
});
