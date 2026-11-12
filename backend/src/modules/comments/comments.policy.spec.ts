import type { SessionUser } from "../../common/types/session-user.js";
import { CommentsPolicy } from "./comments.policy.js";

const user = (id: string, role = "user", banned = false): SessionUser =>
  ({ id, role, banned, name: id, email: `${id}@test.local`, username: id }) as SessionUser;

const visibleOfLan = { authorId: "lan", status: "VISIBLE" as const };
const hiddenOfLan = { authorId: "lan", status: "HIDDEN" as const };

describe("CommentsPolicy.canView", () => {
  it.each(["user", "author", "admin"])("bình luận đang hiện: %s nào cũng thấy", (role) => {
    expect(CommentsPolicy.canView(user("minh", role), visibleOfLan)).toBe(true);
  });

  it.each(["user", "author"])("bình luận đã ẩn: %s không thấy, kể cả người viết", (role) => {
    expect(CommentsPolicy.canView(user("minh", role), hiddenOfLan)).toBe(false);
    expect(CommentsPolicy.canView(user("lan", role), hiddenOfLan)).toBe(false);
  });

  it("trưởng xóm thấy bình luận đã ẩn", () => {
    expect(CommentsPolicy.canView(user("admin1", "admin"), hiddenOfLan)).toBe(true);
    expect(CommentsPolicy.seesHidden(user("admin1", "admin"))).toBe(true);
    expect(CommentsPolicy.seesHidden(user("minh", "author"))).toBe(false);
  });
});

describe("CommentsPolicy.canModify", () => {
  it.each(["user", "author", "admin"])("%s sửa, xóa được bình luận của mình", (role) => {
    expect(CommentsPolicy.canModify(user("lan", role), visibleOfLan)).toBe(true);
  });

  it.each(["user", "author", "admin"])("%s không sửa, xóa bình luận của người khác", (role) => {
    expect(CommentsPolicy.canModify(user("minh", role), visibleOfLan)).toBe(false);
  });

  it("bình luận đã bị ẩn thì người viết không sửa, xóa được nữa", () => {
    expect(CommentsPolicy.canModify(user("lan"), hiddenOfLan)).toBe(false);
  });

  it("người bị cấm không sửa, xóa được, kể cả của mình", () => {
    expect(CommentsPolicy.canModify(user("lan", "user", true), visibleOfLan)).toBe(false);
  });
});
