import type { CommentItem, CommentThread } from "@xom-nho/api";
import { describe, expect, it } from "vitest";
import { addComment, countComments, mentionPrefix, removeComment, replaceComment } from "./threads";

function item(id: string, parentId: string | null = null, authorId = "lan"): CommentItem {
  return {
    id,
    postId: "p1",
    parentId,
    content: `Nội dung ${id}`,
    author: { id: authorId, name: "Lan Anh", username: "lananh", image: null, avatarId: null },
    status: "VISIBLE",
    createdAt: "2026-11-12T01:00:00.000Z",
    editedAt: null,
  };
}

const threads: CommentThread[] = [
  { ...item("g1"), replies: [item("r1", "g1"), item("r2", "g1")] },
  { ...item("g2"), replies: [] },
];

describe("addComment", () => {
  it("bình luận gốc thành nhánh mới ở cuối", () => {
    const result = addComment(threads, item("g3"));

    expect(result.map((t) => t.id)).toEqual(["g1", "g2", "g3"]);
    expect(result[2]?.replies).toEqual([]);
  });

  it("trả lời vào cuối nhánh của nó, không đổi mảng cũ", () => {
    const result = addComment(threads, item("r3", "g1"));

    expect(result[0]?.replies.map((r) => r.id)).toEqual(["r1", "r2", "r3"]);
    expect(threads[0]?.replies).toHaveLength(2);
  });
});

describe("replaceComment", () => {
  it("sửa bình luận gốc vẫn giữ các trả lời", () => {
    const edited = { ...item("g1"), content: "Đã sửa", editedAt: "2026-11-12T02:00:00.000Z" };

    const result = replaceComment(threads, edited);

    expect(result[0]).toMatchObject({ content: "Đã sửa", replies: threads[0]?.replies });
  });

  it("sửa một trả lời", () => {
    const result = replaceComment(threads, { ...item("r2", "g1"), content: "Sửa r2" });

    expect(result[0]?.replies[1]?.content).toBe("Sửa r2");
    expect(result[0]?.replies[0]?.content).toBe("Nội dung r1");
  });
});

describe("removeComment", () => {
  it("xóa bình luận gốc thì mất cả nhánh", () => {
    expect(removeComment(threads, "g1").map((t) => t.id)).toEqual(["g2"]);
  });

  it("xóa một trả lời thì nhánh còn lại", () => {
    expect(removeComment(threads, "r1")[0]?.replies.map((r) => r.id)).toEqual(["r2"]);
  });
});

describe("countComments", () => {
  it("đếm cả trả lời", () => {
    expect(countComments(threads)).toBe(4);
    expect(countComments([])).toBe(0);
  });
});

describe("mentionPrefix", () => {
  it("trả lời một trả lời của người khác thì gọi tên, có dấu tiếng Việt", () => {
    expect(mentionPrefix(item("r1", "g1", "lan"), "minh")).toBe("@Lan Anh ");
  });

  it("trả lời bình luận gốc, hay trả lời của chính mình, thì để trống", () => {
    expect(mentionPrefix(item("g1", null, "lan"), "minh")).toBe("");
    expect(mentionPrefix(item("r1", "g1", "minh"), "minh")).toBe("");
  });
});
