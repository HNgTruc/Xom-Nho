import { ADMIN_MESSAGES, type PostStatus, type Role } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import type { StorageService } from "../../infrastructure/storage/storage.service.js";
import type {
  AdminPostListRow,
  PostDetailRow,
  PostEditRow,
  PostListRow,
  PostsRepository,
} from "./posts.repository.js";
import { PostsService } from "./posts.service.js";

const publishedAt = new Date("2026-11-01T08:00:00.000Z");
const updatedAt = new Date("2026-11-02T09:30:00.000Z");

function listRow(overrides: Partial<PostListRow> = {}): PostListRow {
  return {
    id: "p1",
    title: "Bàn tròn cuối tuần",
    slug: "ban-tron-cuoi-tuan",
    excerpt: "Món ngon dễ nấu",
    publishedAt,
    viewCount: 12,
    author: { id: "tac-gia", name: "Lan Anh", username: "lananh", image: null, avatarId: null },
    category: { name: "Ẩm thực", slug: "am-thuc", color: "rose" },
    tags: [
      { tag: { name: "Ăn vặt", slug: "an-vat" } },
      { tag: { name: "Hà Nội", slug: "ha-noi" } },
    ],
    _count: { comments: 3, likes: 5 },
    media: [{ id: "m1", kind: "IMAGE", mimeType: "image/png" }],
    ...overrides,
  };
}

function detailRow(status: PostStatus = "PUBLISHED", rejectReason: string | null = null) {
  return {
    ...listRow(),
    content: "# Xin chào",
    contentFormat: "MARKDOWN" as const,
    status,
    rejectReason,
    updatedAt,
  } satisfies PostDetailRow;
}

function userOf(role: Role, id = `id-${role}`): SessionUser {
  return { id, name: role, email: `${role}@x.vn`, username: role, role, banned: false };
}

function setup() {
  const repository = {
    findList: vi.fn().mockResolvedValue([[], 0]),
    findByIds: vi.fn().mockResolvedValue([]),
    findBySlug: vi.fn().mockResolvedValue(null),
    incrementViewCount: vi.fn().mockResolvedValue(1),
    findAccessTarget: vi.fn().mockResolvedValue(null),
    findForEdit: vi.fn().mockResolvedValue(null),
    updateWithMedia: vi.fn().mockResolvedValue({ ok: true, removedStorageKeys: [] }),
    deleteWithMedia: vi.fn().mockResolvedValue([]),
    findSlugsStartingWith: vi.fn().mockResolvedValue([]),
    createWithMedia: vi.fn().mockResolvedValue({ ok: true, slug: "ban-tron-cuoi-tuan" }),
    findLikedPostIds: vi.fn().mockResolvedValue(new Set<string>()),
    findLatestComments: vi.fn().mockResolvedValue([]),
    addLike: vi.fn().mockResolvedValue(undefined),
    removeLike: vi.fn().mockResolvedValue(undefined),
    findLikeState: vi.fn().mockResolvedValue({ liked: false, count: 0 }),
  };
  const storage = { remove: vi.fn().mockResolvedValue(undefined) };
  const service = new PostsService(
    repository as unknown as PostsRepository,
    new RateLimiter(() => 0),
    storage as unknown as StorageService,
  );
  return { service, repository, storage };
}

describe("PostsService.list", () => {
  it("chỉ lấy bài đã đăng, đổi trang thành skip/take, truyền bộ lọc xuống repository", async () => {
    const { service, repository } = setup();

    await service.list(userOf("user"), {
      page: 3,
      pageSize: 10,
      sort: "top",
      category: "am-thuc",
      tag: "an-vat",
      author: "lananh",
    });

    expect(repository.findList).toHaveBeenCalledWith(
      { status: "PUBLISHED", categorySlug: "am-thuc", tagSlug: "an-vat", authorUsername: "lananh" },
      { sort: "top", skip: 20, take: 10 },
    );
  });

  it("đổi bản ghi sang PostListItem và tính số trang", async () => {
    const { service, repository } = setup();
    repository.findList.mockResolvedValue([[listRow()], 21]);

    const result = await service.list(userOf("user"), { page: 1, pageSize: 10, sort: "new" });

    expect(result.meta).toEqual({ page: 1, pageSize: 10, total: 21, totalPages: 3 });
    expect(result.items).toEqual([
      {
        id: "p1",
        title: "Bàn tròn cuối tuần",
        slug: "ban-tron-cuoi-tuan",
        excerpt: "Món ngon dễ nấu",
        publishedAt: "2026-11-01T08:00:00.000Z",
        viewCount: 12,
        commentCount: 3,
        likeCount: 5,
        likedByMe: false,
        latestComments: [],
        author: { id: "tac-gia", name: "Lan Anh", username: "lananh", image: null, avatarId: null },
        category: { name: "Ẩm thực", slug: "am-thuc", color: "rose" },
        tags: [
          { name: "Ăn vặt", slug: "an-vat" },
          { name: "Hà Nội", slug: "ha-noi" },
        ],
        media: [{ id: "m1", kind: "IMAGE", mimeType: "image/png" }],
      },
    ]);
  });

  it("không có bài nào thì trả trang rỗng, 0 trang", async () => {
    const { service } = setup();

    const result = await service.list(userOf("user"), { page: 1, pageSize: 10, sort: "new" });

    expect(result).toEqual({ items: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
  });
});

describe("PostsService.list: thích và bình luận xem trước", () => {
  function comment(id: string, postId: string) {
    return {
      id,
      postId,
      content: `Bình luận ${id}`,
      createdAt: new Date("2026-11-03T10:00:00.000Z"),
      author: { id: "u9", name: "Minh", username: "minh", image: null, avatarId: null },
    };
  }

  it("tra lượt thích của người xem và 2 bình luận mới nhất cho cả trang, mỗi thứ một truy vấn", async () => {
    const { service, repository } = setup();
    const viewer = userOf("user");
    repository.findList.mockResolvedValue([[listRow({ id: "a" }), listRow({ id: "b" })], 2]);
    repository.findLikedPostIds.mockResolvedValue(new Set(["b"]));
    repository.findLatestComments.mockResolvedValue([comment("c2", "a"), comment("c1", "a")]);

    const { items } = await service.list(viewer, { page: 1, pageSize: 10, sort: "new" });

    expect(repository.findLikedPostIds).toHaveBeenCalledTimes(1);
    expect(repository.findLikedPostIds).toHaveBeenCalledWith(viewer.id, ["a", "b"]);
    expect(repository.findLatestComments).toHaveBeenCalledWith(["a", "b"], 2);
    expect(items.map((p) => p.likedByMe)).toEqual([false, true]);
    expect(items[0]?.latestComments.map((c) => c.id)).toEqual(["c2", "c1"]);
    expect(items[1]?.latestComments).toEqual([]);
  });

  it("bình luận xem trước chỉ có phần UserSummary của tác giả, thời gian ISO", async () => {
    const { service, repository } = setup();
    repository.findList.mockResolvedValue([[listRow()], 1]);
    repository.findLatestComments.mockResolvedValue([comment("c1", "p1")]);

    const { items } = await service.list(userOf("user"), { page: 1, pageSize: 10, sort: "new" });

    expect(items[0]?.latestComments).toEqual([
      {
        id: "c1",
        content: "Bình luận c1",
        createdAt: "2026-11-03T10:00:00.000Z",
        author: { id: "u9", name: "Minh", username: "minh", image: null, avatarId: null },
      },
    ]);
  });
});

describe("PostsService.like, unlike", () => {
  const published = { status: "PUBLISHED", authorId: "tac-gia" } as const;

  it.each([
    ["hàng xóm", userOf("user")],
    ["cây bút", userOf("author")],
    ["trưởng xóm", userOf("admin")],
    ["chính tác giả", userOf("user", "tac-gia")],
  ])("%s thích được bài đã đăng, nhận số thích mới", async (_label, user) => {
    const { service, repository } = setup();
    repository.findAccessTarget.mockResolvedValue(published);
    repository.findLikeState.mockResolvedValue({ liked: true, count: 4 });

    await expect(service.like(user, "p1")).resolves.toEqual({ liked: true, likeCount: 4 });
    expect(repository.addLike).toHaveBeenCalledWith("p1", user.id);
  });

  it("bài đã ẩn: chủ bài nhận FORBIDDEN, không ghi lượt thích", async () => {
    const { service, repository } = setup();
    repository.findAccessTarget.mockResolvedValue({ status: "ARCHIVED", authorId: "tac-gia" });

    await expect(service.like(userOf("user", "tac-gia"), "p1")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    expect(repository.addLike).not.toHaveBeenCalled();
  });

  it("bài đã ẩn của người khác: NOT_FOUND (không lộ là có)", async () => {
    const { service, repository } = setup();
    repository.findAccessTarget.mockResolvedValue({ status: "ARCHIVED", authorId: "tac-gia" });

    await expect(service.like(userOf("user"), "p1")).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(repository.addLike).not.toHaveBeenCalled();
  });

  it("bài không có hoặc id sai dạng: NOT_FOUND", async () => {
    const { service, repository } = setup();

    await expect(service.like(userOf("user"), "p1")).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(service.unlike(userOf("user"), "../x")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(repository.removeLike).not.toHaveBeenCalled();
  });

  it("bỏ thích được cả bài đã ẩn mà mình xem được", async () => {
    const { service, repository } = setup();
    repository.findAccessTarget.mockResolvedValue({ status: "ARCHIVED", authorId: "tac-gia" });

    await expect(service.unlike(userOf("admin"), "p1")).resolves.toEqual({
      liked: false,
      likeCount: 0,
    });
    expect(repository.removeLike).toHaveBeenCalledWith("p1", "id-admin");
  });

  it("bấm quá 60 lần một phút thì RATE_LIMITED", async () => {
    const { service, repository } = setup();
    repository.findAccessTarget.mockResolvedValue(published);
    const user = userOf("user");

    for (let i = 0; i < 60; i++) await service.like(user, "p1");

    await expect(service.unlike(user, "p1")).rejects.toMatchObject({ code: "RATE_LIMITED" });
    expect(repository.removeLike).not.toHaveBeenCalled();
  });
});

describe("PostsService.getBySlug: thích", () => {
  it("trả số thích và người xem đã thích chưa", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow());
    repository.findLikedPostIds.mockResolvedValue(new Set(["p1"]));

    const post = await service.getBySlug(userOf("user"), "ban-tron-cuoi-tuan");

    expect(post).toMatchObject({ likeCount: 5, likedByMe: true });
    expect(post).not.toHaveProperty("latestComments");
  });

  it("không có người xem thì likedByMe false, không tra lượt thích", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow());

    await expect(service.getBySlug(undefined, "ban-tron-cuoi-tuan")).resolves.toMatchObject({
      likedByMe: false,
    });
    expect(repository.findLikedPostIds).not.toHaveBeenCalled();
  });
});

describe("PostsService.getBySlug", () => {
  it("khách xem được bài đã đăng, có nội dung và ngày sửa", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow());

    const post = await service.getBySlug(undefined, "ban-tron-cuoi-tuan");

    expect(post).toMatchObject({
      content: "# Xin chào",
      contentFormat: "MARKDOWN",
      status: "PUBLISHED",
      rejectReason: null,
      updatedAt: "2026-11-02T09:30:00.000Z",
    });
  });

  it("khách xem bản nháp thì NOT_FOUND, không phải FORBIDDEN", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow("DRAFT"));

    await expect(service.getBySlug(undefined, "ban-tron-cuoi-tuan")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("hàng xóm khác xem bài chờ duyệt thì NOT_FOUND", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow("PENDING"));

    await expect(service.getBySlug(userOf("user"), "ban-tron-cuoi-tuan")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("tác giả xem được bài bị từ chối của mình, kèm lý do", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow("REJECTED", "Bài còn ngắn"));

    const post = await service.getBySlug(userOf("user", "tac-gia"), "ban-tron-cuoi-tuan");

    expect(post).toMatchObject({ status: "REJECTED", rejectReason: "Bài còn ngắn" });
  });

  it("trưởng xóm xem được bản nháp của người khác", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow("DRAFT"));

    await expect(service.getBySlug(userOf("admin"), "ban-tron-cuoi-tuan")).resolves.toMatchObject({
      status: "DRAFT",
    });
  });

  it("bài đã đăng không trả lý do từ chối cũ còn sót trong database", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow("PUBLISHED", "Lý do của lần trước"));

    const post = await service.getBySlug(undefined, "ban-tron-cuoi-tuan");

    expect(post.rejectReason).toBeNull();
  });

  it("không có bài thì NOT_FOUND", async () => {
    const { service } = setup();

    await expect(service.getBySlug(undefined, "khong-co")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("slug sai định dạng thì NOT_FOUND và không truy vấn database", async () => {
    const { service, repository } = setup();

    await expect(service.getBySlug(undefined, "bàn tròn")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(repository.findBySlug).not.toHaveBeenCalled();
  });

  it.each(["Ban-Tron-Cuoi-Tuan", " ban-tron-cuoi-tuan"])(
    "slug %j không đúng dạng chuẩn thì NOT_FOUND (mỗi bài một URL)",
    async (slug) => {
      const { service, repository } = setup();

      await expect(service.getBySlug(undefined, slug)).rejects.toMatchObject({ code: "NOT_FOUND" });
      expect(repository.findBySlug).not.toHaveBeenCalled();
    },
  );

  it("không trả trường thừa của tác giả dù repository có lấy (ví dụ email)", async () => {
    const { service, repository } = setup();
    const row = detailRow();
    repository.findBySlug.mockResolvedValue({
      ...row,
      author: { ...row.author, email: "lan@x.vn" },
      category: { ...row.category, id: "c1" },
    });

    const post = await service.getBySlug(undefined, "ban-tron-cuoi-tuan");

    expect(post.author).toEqual({
      id: "tac-gia",
      name: "Lan Anh",
      username: "lananh",
      image: null,
      avatarId: null,
    });
    expect(post.category).toEqual({ name: "Ẩm thực", slug: "am-thuc", color: "rose" });
  });
});

describe("PostsService.recordView", () => {
  it("chỉ tăng lượt xem cho bài đã đăng", async () => {
    const { service, repository } = setup();

    await service.recordView("p1");

    expect(repository.incrementViewCount).toHaveBeenCalledWith("p1", "PUBLISHED");
  });

  it("id sai dạng thì NOT_FOUND và không chạm database", async () => {
    const { service, repository } = setup();

    await expect(service.recordView("x".repeat(65))).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(repository.incrementViewCount).not.toHaveBeenCalled();
  });

  it("không có bài đã đăng nào khớp thì NOT_FOUND", async () => {
    const { service, repository } = setup();
    repository.incrementViewCount.mockResolvedValue(0);

    await expect(service.recordView("p1")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("PostsService.listPublishedByIds", () => {
  it("giữ thứ tự id truyền vào, bỏ id không còn đăng", async () => {
    const { service, repository } = setup();
    repository.findByIds.mockResolvedValue([listRow({ id: "a" }), listRow({ id: "b" })]);

    const items = await service.listPublishedByIds(userOf("user"), ["b", "mat", "a"]);

    expect(repository.findByIds).toHaveBeenCalledWith(["b", "mat", "a"], "PUBLISHED");
    expect(items.map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("danh sách rỗng thì không truy vấn", async () => {
    const { service, repository } = setup();

    await expect(service.listPublishedByIds(userOf("user"), [])).resolves.toEqual([]);
    expect(repository.findByIds).not.toHaveBeenCalled();
  });
});

describe("PostsService.create", () => {
  const input = {
    title: "",
    content: "Hôm nay xóm mình có chợ phiên ở đầu ngõ\nAi rảnh ghé chơi nhé",
    category: "doi-song",
    mediaIds: ["m1", "m2"],
  };

  beforeEach(() => vi.useFakeTimers({ now: new Date("2026-11-11T10:00:00.000Z") }));
  afterEach(() => vi.useRealTimers());

  it.each(["user", "author", "admin"] as const)(
    "%s đăng thẳng: bài PUBLISHED, có ngày đăng, chữ thường (ADR 0008)",
    async (role) => {
      const { service, repository } = setup();
      repository.findBySlug.mockResolvedValue(detailRow());

      await service.create(userOf(role), input);

      const [data, mediaIds] = repository.createWithMedia.mock.calls[0]!;
      expect(data).toMatchObject({
        status: "PUBLISHED",
        publishedAt: new Date("2026-11-11T10:00:00.000Z"),
        contentFormat: "PLAIN",
        authorId: `id-${role}`,
        categorySlug: "doi-song",
        title: "",
      });
      expect(mediaIds).toEqual(["m1", "m2"]);
    },
  );

  it("không có tiêu đề: slug và tóm tắt lấy từ nội dung, searchText có nội dung bỏ dấu", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow());

    await service.create(userOf("user"), input);

    const [data] = repository.createWithMedia.mock.calls[0]!;
    expect(data.slug).toMatch(/^hom-nay-xom-minh-co-cho-phien/);
    expect(data.excerpt).toBe("Hôm nay xóm mình có chợ phiên ở đầu ngõ Ai rảnh ghé chơi nhé");
    expect(data.searchText).toContain("cho phien");
  });

  it("slug trùng thì thêm hậu tố nhỏ nhất còn trống", async () => {
    const { service, repository } = setup();
    repository.findSlugsStartingWith.mockResolvedValue(["ban-tron", "ban-tron-2", "ban-tron-tiep"]);
    repository.findBySlug.mockResolvedValue(detailRow());

    await service.create(userOf("user"), { ...input, title: "Bàn tròn" });

    expect(repository.createWithMedia.mock.calls[0]![0].slug).toBe("ban-tron-3");
  });

  it("trả bài vừa đăng (đọc lại theo slug)", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow());

    const post = await service.create(userOf("user"), input);

    expect(repository.findBySlug).toHaveBeenCalledWith("ban-tron-cuoi-tuan");
    expect(post.slug).toBe("ban-tron-cuoi-tuan");
  });

  it("danh mục không còn thì VALIDATION_ERROR ở trường category", async () => {
    const { service, repository } = setup();
    repository.createWithMedia.mockResolvedValue({ ok: false, reason: "CATEGORY_NOT_FOUND" });

    await expect(service.create(userOf("user"), input)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      fields: { category: expect.any(String) },
    });
  });

  it("ảnh, video không gắn được (của người khác, đã gắn bài khác) thì VALIDATION_ERROR ở mediaIds", async () => {
    const { service, repository } = setup();
    repository.createWithMedia.mockResolvedValue({ ok: false, reason: "MEDIA_NOT_ATTACHABLE" });

    await expect(service.create(userOf("user"), input)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      fields: { mediaIds: expect.any(String) },
    });
  });

  it("quá 10 bài trong 10 phút thì RATE_LIMITED, không tạo thêm", async () => {
    const { service, repository } = setup();
    repository.findBySlug.mockResolvedValue(detailRow());
    for (let i = 0; i < 10; i++) await service.create(userOf("user"), input);

    await expect(service.create(userOf("user"), input)).rejects.toMatchObject({
      code: "RATE_LIMITED",
    });
    expect(repository.createWithMedia).toHaveBeenCalledTimes(10);
  });
});

describe("PostsService.getVisibleStatus", () => {
  it("bài đã đăng: mọi thành viên nhận trạng thái", async () => {
    const { service, repository } = setup();
    repository.findAccessTarget.mockResolvedValue({ status: "PUBLISHED", authorId: "tac-gia" });

    await expect(service.getVisibleStatus(userOf("user"), "p1")).resolves.toBe("PUBLISHED");
  });

  it("bài đã ẩn: chủ bài và trưởng xóm xem được, người khác NOT_FOUND", async () => {
    const { service, repository } = setup();
    repository.findAccessTarget.mockResolvedValue({ status: "ARCHIVED", authorId: "tac-gia" });

    await expect(service.getVisibleStatus(userOf("author", "tac-gia"), "p1")).resolves.toBe(
      "ARCHIVED",
    );
    await expect(service.getVisibleStatus(userOf("admin"), "p1")).resolves.toBe("ARCHIVED");
    await expect(service.getVisibleStatus(userOf("user"), "p1")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("id sai dạng thì NOT_FOUND, không truy vấn database", async () => {
    const { service, repository } = setup();

    await expect(service.getVisibleStatus(userOf("user"), "../x")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect(repository.findAccessTarget).not.toHaveBeenCalled();
  });
});

describe("PostsService.update, remove", () => {
  function editRow(overrides: Partial<PostEditRow> = {}): PostEditRow {
    return {
      id: "p1",
      slug: "cho-phien",
      title: "Chợ phiên",
      content: "Sáng mai đi chợ",
      status: "PUBLISHED",
      authorId: "tac-gia",
      tags: [{ tag: { name: "ăn vặt" } }],
      media: [{ id: "m1" }],
      ...overrides,
    };
  }
  const author = userOf("user", "tac-gia");

  function ready(row: PostEditRow | null = editRow()) {
    const ctx = setup();
    ctx.repository.findForEdit.mockResolvedValue(row);
    ctx.repository.findBySlug.mockResolvedValue(detailRow());
    return ctx;
  }

  it("đổi chữ thì tính lại tóm tắt, searchText (kèm tag), giữ slug", async () => {
    const { service, repository } = ready();

    await service.update(author, "p1", { title: "Chợ phiên Tết" });

    expect(repository.updateWithMedia).toHaveBeenCalledWith(
      "p1",
      "tac-gia",
      expect.objectContaining({
        title: "Chợ phiên Tết",
        excerpt: "Sáng mai đi chợ",
        searchText: expect.stringContaining("an vat"),
      }),
      undefined,
    );
    expect(repository.findBySlug).toHaveBeenCalledWith("cho-phien");
  });

  it("chỉ đổi danh mục thì không tính lại tóm tắt", async () => {
    const { service, repository } = ready();

    await service.update(author, "p1", { category: "hoi-dap" });

    const changes = repository.updateWithMedia.mock.calls[0]?.[2];
    expect(changes).toEqual({ title: undefined, content: undefined, categorySlug: "hoi-dap" });
  });

  it("file bỏ ra bị xóa khỏi ổ đĩa sau khi lưu", async () => {
    const { service, repository, storage } = ready();
    repository.updateWithMedia.mockResolvedValue({
      ok: true,
      removedStorageKeys: ["images/a.png", "videos/b.mp4"],
    });

    await service.update(author, "p1", { mediaIds: [] });

    expect(storage.remove).toHaveBeenCalledWith("images/a.png");
    expect(storage.remove).toHaveBeenCalledWith("videos/b.mp4");
  });

  it("xóa file trên đĩa lỗi vẫn sửa bài thành công", async () => {
    const { service, repository, storage } = ready();
    repository.updateWithMedia.mockResolvedValue({
      ok: true,
      removedStorageKeys: ["images/a.png"],
    });
    storage.remove.mockRejectedValue(new Error("đĩa bận"));

    await expect(service.update(author, "p1", { mediaIds: [] })).resolves.toBeDefined();
  });

  it("sửa xong mà không còn chữ lẫn ảnh thì 400 ở ô content, không ghi", async () => {
    const { service, repository } = ready(editRow({ media: [] }));

    await expect(service.update(author, "p1", { content: "" })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      fields: { content: expect.any(String) },
    });
    expect(repository.updateWithMedia).not.toHaveBeenCalled();
  });

  it("xóa hết chữ nhưng bài còn ảnh thì được", async () => {
    const { service, repository } = ready();

    await service.update(author, "p1", { content: "" });

    expect(repository.updateWithMedia).toHaveBeenCalled();
  });

  it.each([
    ["CATEGORY_NOT_FOUND", "category"],
    ["MEDIA_NOT_ATTACHABLE", "mediaIds"],
  ] as const)("repository báo %s thì 400 ở ô %s", async (reason, field) => {
    const { service, repository } = ready();
    repository.updateWithMedia.mockResolvedValue({ ok: false, reason });

    await expect(service.update(author, "p1", { title: "x" })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      fields: { [field]: expect.any(String) },
    });
  });

  it.each([
    ["hàng xóm khác", userOf("user")],
    ["trưởng xóm (dùng route admin)", userOf("admin")],
  ])("%s sửa, xóa bài đã đăng của người khác thì FORBIDDEN", async (_, who) => {
    const { service, repository } = ready();

    await expect(service.update(who, "p1", { title: "x" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(service.remove(who, "p1")).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(repository.updateWithMedia).not.toHaveBeenCalled();
    expect(repository.deleteWithMedia).not.toHaveBeenCalled();
  });

  it("bài bị ẩn của người khác thì NOT_FOUND (không lộ là có)", async () => {
    const { service } = ready(editRow({ status: "ARCHIVED" }));

    await expect(service.remove(userOf("user"), "p1")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it.each(["khong-co", "../p1"])("id %j không có hoặc sai dạng thì NOT_FOUND", async (id) => {
    const { service } = ready(null);

    await expect(service.remove(author, id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("tác giả xóa bài: xóa dòng rồi xóa file trên đĩa", async () => {
    const { service, repository, storage } = ready();
    repository.deleteWithMedia.mockResolvedValue(["images/a.png"]);

    await service.remove(author, "p1");

    expect(repository.deleteWithMedia).toHaveBeenCalledWith("p1");
    expect(storage.remove).toHaveBeenCalledWith("images/a.png");
  });
});

describe("PostsService (route admin)", () => {
  const admin = userOf("admin");
  const createdAt = new Date("2026-11-13T07:00:00.000Z");

  function adminRow(overrides: Partial<AdminPostListRow> = {}): AdminPostListRow {
    return {
      id: "p1",
      title: "Bàn tròn cuối tuần",
      slug: "ban-tron-cuoi-tuan",
      excerpt: "Món ngon dễ nấu",
      status: "PUBLISHED",
      rejectReason: null,
      createdAt,
      publishedAt: createdAt,
      viewCount: 12,
      author: { id: "tac-gia", name: "Lan Anh", username: "lananh", image: null, avatarId: null },
      category: { name: "Ẩm thực", slug: "am-thuc", color: "rose" },
      _count: { comments: 4, likes: 2, media: 1 },
      ...overrides,
    };
  }

  function adminSetup(status: PostStatus | null = "PUBLISHED") {
    const { service, repository, storage } = setup();
    repository.findAccessTarget.mockResolvedValue(status ? { status, authorId: "tac-gia" } : null);
    const admin = {
      findAdminList: vi.fn().mockResolvedValue([[adminRow()], 1]),
      setModeration: vi
        .fn()
        .mockImplementation((_id: string, moderation: Partial<AdminPostListRow>) =>
          Promise.resolve(adminRow(moderation)),
        ),
    };
    Object.assign(repository, admin);
    return { service, repository: repository as typeof repository & typeof admin, storage };
  }

  it("adminList: since thành mốc createdAfter, oldest thành asc, từ khóa bỏ dấu", async () => {
    const { service, repository } = adminSetup();

    const result = await service.adminList({
      page: 2,
      pageSize: 20,
      sort: "oldest",
      since: "2026-11-13T07:00:00.000Z",
      q: "Bánh Mì",
      status: "PUBLISHED",
    });

    expect(repository.findAdminList).toHaveBeenCalledWith(
      {
        status: "PUBLISHED",
        categorySlug: undefined,
        authorUsername: undefined,
        searchText: "banh mi",
        createdAfter: new Date("2026-11-13T07:00:00.000Z"),
      },
      { order: "asc", skip: 20, take: 20 },
    );
    expect(result.items[0]).toMatchObject({ id: "p1", commentCount: 4, mediaCount: 1 });
    expect(result.meta).toEqual({ page: 2, pageSize: 20, total: 1, totalPages: 1 });
  });

  it("archive: bài đang hiện thành ARCHIVED, lưu lý do và trưởng xóm đã ẩn", async () => {
    const { service, repository } = adminSetup("PUBLISHED");

    const item = await service.archive(admin, "p1", { reason: "Quảng cáo, rao vặt" });

    expect(repository.setModeration).toHaveBeenCalledWith("p1", {
      status: "ARCHIVED",
      rejectReason: "Quảng cáo, rao vặt",
      reviewerId: admin.id,
    });
    expect(item).toMatchObject({ status: "ARCHIVED", rejectReason: "Quảng cáo, rao vặt" });
  });

  it.each(["ARCHIVED", "DRAFT", "PENDING", "REJECTED"] as const)(
    "archive: bài %s thì CONFLICT, không ghi gì",
    async (status) => {
      const { service, repository } = adminSetup(status);

      await expect(service.archive(admin, "p1", { reason: "Spam" })).rejects.toMatchObject({
        code: "CONFLICT",
        message: ADMIN_MESSAGES.POST_NOT_PUBLISHED,
      });
      expect(repository.setModeration).not.toHaveBeenCalled();
    },
  );

  it("restore: bài đang ẩn thành PUBLISHED, xóa lý do", async () => {
    const { service, repository } = adminSetup("ARCHIVED");

    const item = await service.restore(admin, "p1");

    expect(repository.setModeration).toHaveBeenCalledWith("p1", {
      status: "PUBLISHED",
      rejectReason: null,
      reviewerId: admin.id,
    });
    expect(item.rejectReason).toBeNull();
  });

  it("restore: bài không đang ẩn thì CONFLICT", async () => {
    const { service } = adminSetup("PUBLISHED");
    await expect(service.restore(admin, "p1")).rejects.toMatchObject({
      code: "CONFLICT",
      message: ADMIN_MESSAGES.POST_NOT_HIDDEN,
    });
  });

  it.each([
    ["không có", "p1"],
    ["id sai dạng", "../p1"],
  ])("bài %s thì NOT_FOUND ở mọi route admin", async (_label, id) => {
    const { service } = adminSetup(null);
    const notFound = { code: "NOT_FOUND", message: ADMIN_MESSAGES.POST_NOT_FOUND };

    await expect(service.archive(admin, id, { reason: "Spam" })).rejects.toMatchObject(notFound);
    await expect(service.restore(admin, id)).rejects.toMatchObject(notFound);
    await expect(service.adminRemove(id)).rejects.toMatchObject(notFound);
  });

  it("adminRemove: xóa bài của người khác và file trên đĩa", async () => {
    const { service, repository, storage } = adminSetup("PUBLISHED");
    repository.deleteWithMedia.mockResolvedValue(["images/a.png"]);

    await service.adminRemove("p1");

    expect(repository.deleteWithMedia).toHaveBeenCalledWith("p1");
    expect(storage.remove).toHaveBeenCalledWith("images/a.png");
  });
});

describe("toPostDetail: lý do ẩn", () => {
  it("bài đang ẩn trả lý do cho tác giả; bài đã hiện lại không trả lý do cũ", async () => {
    const { service, repository } = setup();
    const author = userOf("user", "tac-gia");

    repository.findBySlug.mockResolvedValue(detailRow("ARCHIVED", "Lời lẽ xúc phạm"));
    expect((await service.getBySlug(author, "ban-tron-cuoi-tuan")).rejectReason).toBe(
      "Lời lẽ xúc phạm",
    );

    repository.findBySlug.mockResolvedValue(detailRow("PUBLISHED", "Lời lẽ xúc phạm"));
    expect((await service.getBySlug(author, "ban-tron-cuoi-tuan")).rejectReason).toBeNull();
  });
});
