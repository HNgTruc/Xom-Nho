import type { NestExpressApplication } from "@nestjs/platform-express";
import type { PostListItem } from "@xom-nho/api";
import request from "supertest";
import type { PostStatus, PrismaClient } from "../../src/generated/prisma/client.js";
import { buildPostSearchText } from "../../src/modules/posts/posts.search-text.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";

const DAY = 24 * 60 * 60 * 1000;
const base = new Date("2026-10-01T00:00:00.000Z").getTime();

/** Các route đọc công khai ngoài `posts`: tag, hồ sơ, tìm kiếm. */
describe("Tag, hồ sơ, tìm kiếm (/api/v1)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;

  const http = () => request(app.getHttpServer());
  const slugsOf = (body: { data: PostListItem[] }) => body.data.map((p) => p.slug);

  async function createPost(input: {
    title: string;
    slug: string;
    authorId: string;
    categoryId: string;
    tags?: { id: string; name: string }[];
    status?: PostStatus;
    daysAgo?: number;
  }) {
    const status = input.status ?? "PUBLISHED";
    const tags = input.tags ?? [];
    await prisma.post.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: "",
        content: "",
        searchText: buildPostSearchText({
          title: input.title,
          excerpt: "",
          tagNames: tags.map((t) => t.name),
        }),
        status,
        authorId: input.authorId,
        categoryId: input.categoryId,
        publishedAt: status === "PUBLISHED" ? new Date(base - (input.daysAgo ?? 0) * DAY) : null,
        tags: { create: tags.map((t) => ({ tagId: t.id })) },
      },
    });
  }

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);

    await prisma.user.create({
      data: {
        id: "lan",
        name: "Lan",
        email: "lan@test.local",
        username: "lan",
        role: "author",
        bio: "Thích nấu ăn",
        createdAt: new Date(base),
      },
    });
    await prisma.user.create({
      data: {
        id: "minh",
        name: "Minh",
        email: "minh@test.local",
        username: "minh",
        banned: true,
        banReason: "spam",
      },
    });
    const amThuc = await prisma.category.create({ data: { name: "Ẩm thực", slug: "am-thuc" } });
    const doiSong = await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
    const anVat = await prisma.tag.create({ data: { name: "Ăn vặt", slug: "an-vat" } });
    const doAn = await prisma.tag.create({ data: { name: "Đồ ăn", slug: "do-an" } });
    await prisma.tag.create({ data: { name: "Chưa dùng", slug: "chua-dung" } });

    await createPost({
      title: "Đồ ăn đường phố Hà Nội",
      slug: "do-an-duong-pho",
      authorId: "lan",
      categoryId: amThuc.id,
      tags: [anVat, doAn],
      daysAgo: 2,
    });
    await createPost({
      title: "Bàn tròn cuối tuần",
      slug: "ban-tron",
      authorId: "lan",
      categoryId: doiSong.id,
      tags: [doAn],
      daysAgo: 1,
    });
    await createPost({
      title: "Bàn tròn bản nháp",
      slug: "ban-tron-nhap",
      authorId: "lan",
      categoryId: doiSong.id,
      status: "DRAFT",
    });
    await createPost({
      title: "Quán ăn đêm",
      slug: "quan-an-dem",
      authorId: "minh",
      categoryId: amThuc.id,
      daysAgo: 0,
    });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe("GET /tags", () => {
    it("q rỗng: mọi tag, tag gắn nhiều bài trước", async () => {
      const res = await http().get("/api/v1/tags").expect(200);

      expect(res.body.data.map((t: { slug: string }) => t.slug)).toEqual([
        "do-an",
        "an-vat",
        "chua-dung",
      ]);
      expect(res.body.data[0]).toEqual({ id: expect.any(String), name: "Đồ ăn", slug: "do-an" });
    });

    it.each([
      ["do", ["do-an"]],
      ["đồ", ["do-an"]],
      ["vat", ["an-vat"]],
      ["Ăn", ["do-an", "an-vat"]],
      ["khong-co", []],
    ])("q=%s gợi ý đúng tag, có dấu hay không đều được", async (q, expected) => {
      const res = await http().get("/api/v1/tags").query({ q }).expect(200);

      expect(res.body.data.map((t: { slug: string }) => t.slug)).toEqual(expected);
    });

    it("q quá dài thì 400", async () => {
      const res = await http()
        .get("/api/v1/tags")
        .query({ q: "a".repeat(31) })
        .expect(400);

      expect(res.body.error.fields).toHaveProperty("q");
    });
  });

  describe("GET /tags/:slug", () => {
    it("trả tag, kể cả tag chưa có bài", async () => {
      const res = await http().get("/api/v1/tags/chua-dung").expect(200);

      expect(res.body.data).toMatchObject({ name: "Chưa dùng", slug: "chua-dung" });
    });

    it.each(["khong-co", "An-Vat"])("%s thì 404", async (slug) => {
      const res = await http().get(`/api/v1/tags/${slug}`).expect(404);

      expect(res.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /users/:username", () => {
    it("hồ sơ công khai, số bài chỉ đếm bài đã đăng, không có email", async () => {
      const res = await http().get("/api/v1/users/lan").expect(200);

      expect(res.body.data).toEqual({
        id: "lan",
        name: "Lan",
        username: "lan",
        image: null,
        bio: "Thích nấu ăn",
        role: "author",
        createdAt: new Date(base).toISOString(),
        postCount: 2,
      });
    });

    it("người bị cấm vẫn có hồ sơ, nhưng không lộ thông tin cấm", async () => {
      const res = await http().get("/api/v1/users/minh").expect(200);

      expect(res.body.data).not.toHaveProperty("banned");
      expect(res.body.data).not.toHaveProperty("banReason");
      expect(JSON.stringify(res.body)).not.toContain("spam");
    });

    it.each(["khongco", "Lan"])("%s thì 404", async (username) => {
      await http().get(`/api/v1/users/${username}`).expect(404);
    });
  });

  describe("GET /search", () => {
    it.each([
      ["ban tron", ["ban-tron"]],
      ["Bàn Tròn", ["ban-tron"]],
      ["do an", ["do-an-duong-pho", "ban-tron"]],
      ["ha noi", ["do-an-duong-pho"]],
      ["an", ["quan-an-dem", "do-an-duong-pho", "ban-tron"]],
    ])("q=%s tìm đúng bài đã đăng, có dấu hay không", async (q, expected) => {
      const res = await http().get("/api/v1/search").query({ q }).expect(200);

      expect([...slugsOf(res.body)].sort()).toEqual([...expected].sort());
      expect(res.body.meta.total).toBe(expected.length);
    });

    it("mọi từ đều phải có", async () => {
      const res = await http().get("/api/v1/search").query({ q: "ban tron ha noi" }).expect(200);

      expect(slugsOf(res.body)).toEqual([]);
    });

    it("kết quả đủ trường như danh sách bài", async () => {
      const res = await http().get("/api/v1/search").query({ q: "ha noi" }).expect(200);

      expect(res.body.data[0]).toMatchObject({
        slug: "do-an-duong-pho",
        author: { id: "lan", name: "Lan", username: "lan", image: null },
        category: { name: "Ẩm thực", slug: "am-thuc", color: "amber" },
        tags: [
          { name: "Ăn vặt", slug: "an-vat" },
          { name: "Đồ ăn", slug: "do-an" },
        ],
      });
      expect(res.body.data[0]).not.toHaveProperty("content");
    });

    it("lọc thêm theo danh mục", async () => {
      const res = await http()
        .get("/api/v1/search")
        .query({ q: "do an", category: "doi-song" })
        .expect(200);

      expect(slugsOf(res.body)).toEqual(["ban-tron"]);
    });

    it("phân trang", async () => {
      const res = await http()
        .get("/api/v1/search")
        .query({ q: "an", pageSize: 2, page: 2 })
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toEqual({ page: 2, pageSize: 2, total: 3, totalPages: 2 });
    });

    it.each(["", "   ", '+-*"()@'])("q=%j trả trang rỗng, không lỗi", async (q) => {
      const res = await http().get("/api/v1/search").query({ q }).expect(200);

      expect(res.body).toEqual({
        data: [],
        meta: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
      });
    });

    it("toán tử boolean trong từ khóa không có tác dụng", async () => {
      const res = await http().get("/api/v1/search").query({ q: "ban -tron" }).expect(200);

      expect(slugsOf(res.body)).toEqual(["ban-tron"]);
    });

    it("q quá dài thì 400", async () => {
      await http()
        .get("/api/v1/search")
        .query({ q: "a".repeat(101) })
        .expect(400);
    });
  });
});
