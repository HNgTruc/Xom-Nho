import type { PostStatus, Role } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";
import { RateLimiter } from "../../infrastructure/rate-limit/rate-limiter.js";
import type { PostDetailRow, PostListRow, PostsRepository } from "./posts.repository.js";
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
    author: { id: "tac-gia", name: "Lan Anh", username: "lananh", image: null },
    category: { name: "Ẩm thực", slug: "am-thuc", color: "rose" },
    tags: [
      { tag: { name: "Ăn vặt", slug: "an-vat" } },
      { tag: { name: "Hà Nội", slug: "ha-noi" } },
    ],
    _count: { comments: 3 },
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
    findSlugsStartingWith: vi.fn().mockResolvedValue([]),
    createWithMedia: vi.fn().mockResolvedValue({ ok: true, slug: "ban-tron-cuoi-tuan" }),
  };
  const service = new PostsService(
    repository as unknown as PostsRepository,
    new RateLimiter(() => 0),
  );
  return { service, repository };
}

describe("PostsService.list", () => {
  it("chỉ lấy bài đã đăng, đổi trang thành skip/take, truyền bộ lọc xuống repository", async () => {
    const { service, repository } = setup();

    await service.list({
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

    const result = await service.list({ page: 1, pageSize: 10, sort: "new" });

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
        author: { id: "tac-gia", name: "Lan Anh", username: "lananh", image: null },
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

    const result = await service.list({ page: 1, pageSize: 10, sort: "new" });

    expect(result).toEqual({ items: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 } });
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

    const items = await service.listPublishedByIds(["b", "mat", "a"]);

    expect(repository.findByIds).toHaveBeenCalledWith(["b", "mat", "a"], "PUBLISHED");
    expect(items.map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("danh sách rỗng thì không truy vấn", async () => {
    const { service, repository } = setup();

    await expect(service.listPublishedByIds([])).resolves.toEqual([]);
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
