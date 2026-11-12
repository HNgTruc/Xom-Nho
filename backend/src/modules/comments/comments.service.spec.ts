import { COMMENT_MESSAGES } from "@xom-nho/api";
import { AppException } from "../../common/exceptions/app-exception.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import type { PostsService } from "../posts/posts.service.js";
import type { CommentRow, CommentsRepository } from "./comments.repository.js";
import { CommentsService } from "./comments.service.js";

const user = (id: string, role = "user"): SessionUser =>
  ({ id, role, banned: false, name: id, email: `${id}@test.local`, username: id }) as SessionUser;
const lan = user("lan");
const minh = user("minh");
const admin = user("admin1", "admin");

function row(overrides: Partial<CommentRow> = {}): CommentRow {
  return {
    id: "c1",
    postId: "p1",
    parentId: null,
    content: "Hay quá",
    status: "VISIBLE",
    authorId: "lan",
    createdAt: new Date("2026-11-12T01:00:00.000Z"),
    editedAt: null,
    author: { id: "lan", name: "Lan", username: "lan", image: null, avatarId: null },
    ...overrides,
  };
}

function setup(options: { postStatus?: string; rows?: CommentRow[] } = {}) {
  const byId = new Map((options.rows ?? []).map((r) => [r.id, r]));
  const repository = {
    findByPost: vi.fn().mockResolvedValue(options.rows ?? []),
    findById: vi.fn().mockImplementation((id: string) => Promise.resolve(byId.get(id) ?? null)),
    create: vi
      .fn()
      .mockImplementation((data: Partial<CommentRow>) =>
        Promise.resolve(row({ id: "moi", ...data })),
      ),
    updateContent: vi
      .fn()
      .mockImplementation((id: string, content: string, editedAt: Date) =>
        Promise.resolve(row({ ...byId.get(id), content, editedAt })),
      ),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  const posts = {
    getVisibleStatus: vi.fn().mockResolvedValue(options.postStatus ?? "PUBLISHED"),
  };
  // Đồng hồ giả: test tự cho thời gian trôi để kiểm tra giới hạn tần suất
  const clock = { now: 0 };
  const service = new CommentsService(
    repository as unknown as CommentsRepository,
    posts as unknown as PostsService,
    new RateLimiter(() => clock.now),
  );
  return { service, repository, posts, clock };
}

/** Lỗi nghiệp vụ mà service ném: mã và câu. */
async function errorOf(promise: Promise<unknown>) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(AppException);
  const { code, message } = error as AppException;
  return { code, message };
}

describe("CommentsService.list", () => {
  it("ghép bình luận gốc với trả lời, theo thứ tự cũ trước", async () => {
    const { service } = setup({
      rows: [
        row({ id: "g1" }),
        row({ id: "g2" }),
        row({ id: "r1", parentId: "g1" }),
        row({ id: "r2", parentId: "g1" }),
      ],
    });

    const threads = await service.list(minh, "p1");

    expect(threads.map((t) => [t.id, t.replies.map((r) => r.id)])).toEqual([
      ["g1", ["r1", "r2"]],
      ["g2", []],
    ]);
  });

  it("người thường chỉ lấy bình luận đang hiện, trưởng xóm lấy cả bình luận đã ẩn", async () => {
    const { service, repository } = setup();

    await service.list(minh, "p1");
    await service.list(admin, "p1");

    expect(repository.findByPost).toHaveBeenNthCalledWith(1, "p1", ["VISIBLE"]);
    expect(repository.findByPost).toHaveBeenNthCalledWith(2, "p1", ["VISIBLE", "HIDDEN"]);
  });

  it("bỏ trả lời mồ côi khi bình luận gốc đã ẩn với người xem", async () => {
    const { service } = setup({ rows: [row({ id: "r1", parentId: "g-an" })] });

    expect(await service.list(minh, "p1")).toEqual([]);
  });

  it("bài không xem được thì NOT_FOUND, không đọc bình luận", async () => {
    const { service, repository, posts } = setup();
    posts.getVisibleStatus.mockRejectedValueOnce(new AppException("NOT_FOUND"));

    await expect(service.list(minh, "p1")).rejects.toBeInstanceOf(AppException);
    expect(repository.findByPost).not.toHaveBeenCalled();
  });
});

describe("CommentsService.create", () => {
  it("bình luận gốc: người viết là người đang đăng nhập, không có parentId", async () => {
    const { service, repository } = setup();

    const comment = await service.create(minh, "p1", { content: "Chào xóm" });

    expect(repository.create).toHaveBeenCalledWith({
      postId: "p1",
      authorId: "minh",
      parentId: null,
      content: "Chào xóm",
    });
    expect(comment.id).toBe("moi");
  });

  it("trả lời một trả lời thì gắn vào bình luận gốc của nhánh (một cấp)", async () => {
    const { service, repository } = setup({
      rows: [row({ id: "g1" }), row({ id: "r1", parentId: "g1" })],
    });

    await service.create(minh, "p1", { content: "@Lan đúng rồi", parentId: "r1" });

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ parentId: "g1" }));
  });

  it.each([
    ["không có", []],
    ["thuộc bài khác", [row({ id: "g1", postId: "p2" })]],
    ["đã ẩn", [row({ id: "g1", status: "HIDDEN" })]],
  ])("trả lời bình luận %s thì báo ở ô parentId", async (_, rows) => {
    const { service, repository } = setup({ rows });

    const error = await errorOf(service.create(minh, "p1", { content: "ok", parentId: "g1" }));

    expect(error).toEqual({ code: "VALIDATION_ERROR", message: COMMENT_MESSAGES.PARENT_GONE });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("trả lời một trả lời mà bình luận gốc đã ẩn thì không được", async () => {
    const { service } = setup({
      rows: [row({ id: "g1", status: "HIDDEN" }), row({ id: "r1", parentId: "g1" })],
    });

    const error = await errorOf(service.create(minh, "p1", { content: "ok", parentId: "r1" }));

    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("bài đã bị ẩn (chủ bài vẫn mở được) thì không nhận bình luận", async () => {
    const { service, repository } = setup({ postStatus: "ARCHIVED" });

    const error = await errorOf(service.create(lan, "p1", { content: "ok" }));

    expect(error).toEqual({ code: "FORBIDDEN", message: COMMENT_MESSAGES.POST_CLOSED });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("gửi bình luận thứ hai trong vòng 10 giây thì RATE_LIMITED, không ghi", async () => {
    const { service, repository, clock } = setup();
    await service.create(minh, "p1", { content: "lần 1" });
    clock.now = 9_999;

    const error = await errorOf(service.create(minh, "p1", { content: "lần 2" }));

    expect(error).toEqual({ code: "RATE_LIMITED", message: COMMENT_MESSAGES.RATE_LIMITED });
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it("đủ 10 giây thì gửi tiếp được; người khác không bị ảnh hưởng", async () => {
    const { service, clock } = setup();
    await service.create(minh, "p1", { content: "lần 1" });

    await expect(service.create(lan, "p1", { content: "của Lan" })).resolves.toBeDefined();
    clock.now = 10_000;
    await expect(service.create(minh, "p1", { content: "lần 2" })).resolves.toBeDefined();
  });

  it("bình luận bị từ chối (trả lời bình luận không còn) không tính vào giới hạn", async () => {
    const { service } = setup();
    await errorOf(service.create(minh, "p1", { content: "ok", parentId: "khong-co" }));

    await expect(service.create(minh, "p1", { content: "ok" })).resolves.toBeDefined();
  });
});

describe("CommentsService.update, remove", () => {
  it("người viết sửa được, có editedAt", async () => {
    const { service } = setup({ rows: [row()] });

    const comment = await service.update(lan, "c1", { content: "Hay thật" });

    expect(comment.content).toBe("Hay thật");
    expect(comment.editedAt).not.toBeNull();
  });

  it("nội dung không đổi thì không ghi, không đánh dấu đã sửa", async () => {
    const { service, repository } = setup({ rows: [row()] });

    const comment = await service.update(lan, "c1", { content: "Hay quá" });

    expect(repository.updateContent).not.toHaveBeenCalled();
    expect(comment.editedAt).toBeNull();
  });

  it.each([
    ["hàng xóm khác", minh],
    ["trưởng xóm", admin],
  ])("%s sửa, xóa bình luận của người khác thì FORBIDDEN", async (_, who) => {
    const { service, repository } = setup({ rows: [row()] });

    expect((await errorOf(service.update(who, "c1", { content: "x" }))).code).toBe("FORBIDDEN");
    expect((await errorOf(service.remove(who, "c1"))).code).toBe("FORBIDDEN");
    expect(repository.updateContent).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("bình luận đã ẩn: người viết nhận NOT_FOUND (không lộ là còn)", async () => {
    const { service } = setup({ rows: [row({ status: "HIDDEN" })] });

    expect((await errorOf(service.remove(lan, "c1"))).code).toBe("NOT_FOUND");
  });

  it.each(["khong-co", "../c1"])("id %j không có hoặc sai dạng thì NOT_FOUND", async (id) => {
    const { service, repository } = setup({ rows: [row()] });

    expect((await errorOf(service.remove(lan, id))).code).toBe("NOT_FOUND");
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it("bài chứa bình luận không còn xem được thì NOT_FOUND", async () => {
    const { service, posts } = setup({ rows: [row()] });
    posts.getVisibleStatus.mockRejectedValueOnce(new AppException("NOT_FOUND"));

    await expect(service.remove(lan, "c1")).rejects.toBeInstanceOf(AppException);
  });

  it("người viết xóa được", async () => {
    const { service, repository } = setup({ rows: [row()] });

    await service.remove(lan, "c1");

    expect(repository.delete).toHaveBeenCalledWith("c1");
  });
});
