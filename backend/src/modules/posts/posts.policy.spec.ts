import { POST_STATUS_VALUES, type Role } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";
import { PostsPolicy } from "./posts.policy.js";

function userOf(role: Role, id = `id-${role}`, banned = false): SessionUser {
  return { id, name: role, email: `${role}@x.vn`, username: role, role, banned };
}

const AUTHOR_ID = "tac-gia";
const NOT_PUBLISHED = POST_STATUS_VALUES.filter((status) => status !== "PUBLISHED");

describe("PostsPolicy.canView", () => {
  describe("bài đã đăng", () => {
    const post = { status: "PUBLISHED", authorId: AUTHOR_ID } as const;

    it.each([
      ["khách", undefined],
      ["hàng xóm", userOf("user")],
      ["cây bút", userOf("author")],
      ["trưởng xóm", userOf("admin")],
      ["người bị cấm", userOf("user", "x", true)],
    ])("%s xem được", (_label, user) => {
      expect(PostsPolicy.canView(user, post)).toBe(true);
    });
  });

  describe.each(NOT_PUBLISHED)("bài %s", (status) => {
    const post = { status, authorId: AUTHOR_ID };

    it("khách không xem được", () => {
      expect(PostsPolicy.canView(undefined, post)).toBe(false);
    });

    it("hàng xóm khác không xem được", () => {
      expect(PostsPolicy.canView(userOf("user"), post)).toBe(false);
    });

    it("cây bút khác không xem được", () => {
      expect(PostsPolicy.canView(userOf("author"), post)).toBe(false);
    });

    it("chính tác giả xem được", () => {
      expect(PostsPolicy.canView(userOf("user", AUTHOR_ID), post)).toBe(true);
    });

    it("trưởng xóm xem được", () => {
      expect(PostsPolicy.canView(userOf("admin"), post)).toBe(true);
    });

    it("tác giả đang bị cấm không xem được", () => {
      expect(PostsPolicy.canView(userOf("user", AUTHOR_ID, true), post)).toBe(false);
    });
  });
});

describe("PostsPolicy.canModify", () => {
  it.each(["user", "author", "admin"] as const)("%s sửa, xóa được bài của mình", (role) => {
    expect(
      PostsPolicy.canModify(userOf(role, AUTHOR_ID), { status: "PUBLISHED", authorId: AUTHOR_ID }),
    ).toBe(true);
  });

  it.each(["user", "author", "admin"] as const)(
    "%s không sửa, xóa bài của người khác qua route thường",
    (role) => {
      expect(
        PostsPolicy.canModify(userOf(role), { status: "PUBLISHED", authorId: AUTHOR_ID }),
      ).toBe(false);
    },
  );

  it("tác giả vẫn sửa, xóa được bài đang bị ẩn của mình", () => {
    expect(
      PostsPolicy.canModify(userOf("user", AUTHOR_ID), { status: "ARCHIVED", authorId: AUTHOR_ID }),
    ).toBe(true);
  });

  it("người bị cấm không sửa, xóa được, kể cả bài của mình", () => {
    expect(
      PostsPolicy.canModify(userOf("user", AUTHOR_ID, true), {
        status: "PUBLISHED",
        authorId: AUTHOR_ID,
      }),
    ).toBe(false);
  });
});

describe("PostsPolicy.canLike", () => {
  const published = { status: "PUBLISHED", authorId: AUTHOR_ID } as const;

  it.each([
    ["hàng xóm", userOf("user")],
    ["cây bút", userOf("author")],
    ["trưởng xóm", userOf("admin")],
    ["chính tác giả", userOf("user", AUTHOR_ID)],
  ])("%s thích được bài đã đăng", (_label, user) => {
    expect(PostsPolicy.canLike(user, published)).toBe(true);
  });

  it("người bị cấm không thích được", () => {
    expect(PostsPolicy.canLike(userOf("user", "x", true), published)).toBe(false);
  });

  it.each(NOT_PUBLISHED)("bài %s: kể cả tác giả, trưởng xóm cũng không thích được", (status) => {
    const post = { status, authorId: AUTHOR_ID };
    expect(PostsPolicy.canLike(userOf("user", AUTHOR_ID), post)).toBe(false);
    expect(PostsPolicy.canLike(userOf("admin"), post)).toBe(false);
  });
});

describe("PostsPolicy.canArchive, canRestore (route admin)", () => {
  it("chỉ ẩn được bài đang hiện", () => {
    expect(PostsPolicy.canArchive({ status: "PUBLISHED" })).toBe(true);
  });

  it.each(NOT_PUBLISHED)("bài %s không ẩn được", (status) => {
    expect(PostsPolicy.canArchive({ status })).toBe(false);
  });

  it("chỉ hiện lại được bài đang ẩn", () => {
    expect(PostsPolicy.canRestore({ status: "ARCHIVED" })).toBe(true);
  });

  it.each(POST_STATUS_VALUES.filter((status) => status !== "ARCHIVED"))(
    "bài %s không hiện lại được",
    (status) => {
      expect(PostsPolicy.canRestore({ status })).toBe(false);
    },
  );
});
