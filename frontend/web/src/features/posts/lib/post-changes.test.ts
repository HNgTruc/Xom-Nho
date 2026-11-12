import type { PostDetail } from "@xom-nho/api";
import { updatePostSchema } from "@xom-nho/api";
import { describe, expect, it } from "vitest";
import { hasChanges, postChanges, postEditorValues, type PostEditorValues } from "./post-changes";

const initial: PostEditorValues = {
  title: "Chợ phiên đầu tháng",
  content: "Sáng mai đường Đặng Dung có chợ phiên.\nAi rảnh ghé nhé.",
  category: "doi-song",
  mediaIds: ["m1", "m2"],
};

describe("postChanges", () => {
  it("không đổi gì thì rỗng, và schema báo chưa thay đổi gì", () => {
    const changes = postChanges(initial, { ...initial, mediaIds: [...initial.mediaIds] });
    expect(changes).toEqual({});
    expect(hasChanges(changes)).toBe(false);
    expect(updatePostSchema.safeParse(changes).error?.issues[0]?.message).toBe(
      "Bạn chưa thay đổi gì",
    );
  });

  it("chỉ thêm khoảng trắng hai đầu thì không tính là sửa", () => {
    const changes = postChanges(initial, {
      ...initial,
      title: `  ${initial.title} `,
      content: `\n${initial.content}  `,
    });
    expect(changes).toEqual({});
  });

  it("chỉ gửi trường đã đổi", () => {
    expect(postChanges(initial, { ...initial, title: "Chợ phiên Đà Lạt" })).toEqual({
      title: "Chợ phiên Đà Lạt",
    });
    expect(postChanges(initial, { ...initial, category: "hoi-dap" })).toEqual({
      category: "hoi-dap",
    });
  });

  it("xóa hết tiêu đề vẫn là thay đổi (gửi chuỗi rỗng)", () => {
    expect(postChanges(initial, { ...initial, title: "   " })).toEqual({ title: "   " });
    expect(updatePostSchema.parse({ title: "   " })).toEqual({ title: "" });
  });

  it("chữ có dấu dạng NFD khác NFC thì tính là sửa (backend lưu đúng chuỗi người dùng gõ)", () => {
    const nfd = initial.content.normalize("NFD");
    expect(postChanges(initial, { ...initial, content: nfd })).toEqual({ content: nfd });
  });

  it("thêm, gỡ hay đổi thứ tự ảnh thì gửi cả danh sách", () => {
    expect(postChanges(initial, { ...initial, mediaIds: ["m1", "m2", "m3"] })).toEqual({
      mediaIds: ["m1", "m2", "m3"],
    });
    expect(postChanges(initial, { ...initial, mediaIds: ["m2"] })).toEqual({ mediaIds: ["m2"] });
    expect(postChanges(initial, { ...initial, mediaIds: ["m2", "m1"] })).toEqual({
      mediaIds: ["m2", "m1"],
    });
    expect(postChanges(initial, { ...initial, mediaIds: [] })).toEqual({ mediaIds: [] });
  });

  it("gỡ hết ảnh và xóa hết chữ thì schema chặn bài trống", () => {
    const changes = postChanges(initial, { ...initial, content: "", mediaIds: [] });
    expect(updatePostSchema.safeParse(changes).error?.issues[0]?.path).toEqual(["content"]);
  });
});

describe("postEditorValues", () => {
  it("lấy tiêu đề, nội dung, slug danh mục và id ảnh theo thứ tự", () => {
    const post = {
      title: "",
      content: "Có ai thấy con mèo vàng không?",
      category: { name: "Hỏi đáp", slug: "hoi-dap", color: "blue" },
      media: [
        { id: "v1", kind: "VIDEO", mimeType: "video/mp4" },
        { id: "i1", kind: "IMAGE", mimeType: "image/jpeg" },
      ],
    } as unknown as PostDetail;
    expect(postEditorValues(post)).toEqual({
      title: "",
      content: "Có ai thấy con mèo vàng không?",
      category: "hoi-dap",
      mediaIds: ["v1", "i1"],
    });
  });
});
