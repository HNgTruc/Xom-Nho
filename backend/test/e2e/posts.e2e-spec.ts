import type { NestExpressApplication } from "@nestjs/platform-express";
import type { PostListItem } from "@xom-nho/shared";
import request from "supertest";
import type { PostStatus, PrismaClient } from "../../src/generated/prisma/client.js";
import { buildPostSearchText } from "../../src/modules/posts/posts.search-text.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";

const WEB_ORIGIN = "http://localhost:3000";
const DAY = 24 * 60 * 60 * 1000;
const base = new Date("2026-10-01T00:00:00.000Z").getTime();

describe("Đọc bài (/api/v1/posts)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let ids: Record<string, string>;

  const http = () => request(app.getHttpServer());
  const slugsOf = (body: { data: PostListItem[] }) => body.data.map((p) => p.slug);

  /** Đăng ký qua Better Auth, đặt vai trò trong database, trả cookie phiên và id. */
  async function signUp(email: string, role = "user"): Promise<{ cookie: string; id: string }> {
    const res = await http()
      .post("/api/auth/sign-up/email")
      .set("Origin", WEB_ORIGIN)
      .send({ name: email.split("@")[0], email, password: "matkhau123" })
      .expect(200);
    const user = await prisma.user.update({ where: { email }, data: { role } });
    const setCookie = res.headers["set-cookie"] as unknown as string[];
    return { cookie: setCookie.map((c) => c.split(";")[0]).join("; "), id: user.id };
  }

  async function createPost(input: {
    slug: string;
    authorId: string;
    categoryId: string;
    status?: PostStatus;
    daysAgo?: number;
    viewCount?: number;
    tagIds?: string[];
  }) {
    const status = input.status ?? "PUBLISHED";
    const post = await prisma.post.create({
      data: {
        title: input.slug,
        slug: input.slug,
        excerpt: "",
        content: `Nội dung ${input.slug}`,
        searchText: buildPostSearchText({ title: input.slug, excerpt: "", tagNames: [] }),
        status,
        viewCount: input.viewCount ?? 0,
        authorId: input.authorId,
        categoryId: input.categoryId,
        publishedAt: status === "PUBLISHED" ? new Date(base - (input.daysAgo ?? 0) * DAY) : null,
        updatedAt: new Date(base),
        tags: { create: (input.tagIds ?? []).map((tagId) => ({ tagId })) },
      },
    });
    return post.id;
  }

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);

    const lan = await prisma.user.create({
      data: { id: "lan", name: "Lan", email: "lan@test.local", username: "lan" },
    });
    const minh = await prisma.user.create({
      data: { id: "minh", name: "Minh", email: "minh@test.local", username: "minh" },
    });
    const amThuc = await prisma.category.create({
      data: { name: "Ẩm thực", slug: "am-thuc", color: "rose" },
    });
    const doiSong = await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
    const anVat = await prisma.tag.create({ data: { name: "Ăn vặt", slug: "an-vat" } });

    ids = {
      lan: lan.id,
      moi: await createPost({
        slug: "moi-nhat",
        authorId: lan.id,
        categoryId: amThuc.id,
        daysAgo: 0,
        viewCount: 5,
        tagIds: [anVat.id],
      }),
      cu: await createPost({
        slug: "cu-hon",
        authorId: minh.id,
        categoryId: doiSong.id,
        daysAgo: 3,
        viewCount: 90,
      }),
      giua: await createPost({
        slug: "o-giua",
        authorId: lan.id,
        categoryId: amThuc.id,
        daysAgo: 1,
        viewCount: 40,
      }),
      nhap: await createPost({
        slug: "ban-nhap",
        authorId: lan.id,
        categoryId: amThuc.id,
        status: "DRAFT",
      }),
      cho: await createPost({
        slug: "cho-duyet",
        authorId: minh.id,
        categoryId: amThuc.id,
        status: "PENDING",
      }),
    };

    await prisma.comment.createMany({
      data: [
        { content: "Hay", postId: ids.moi!, authorId: minh.id },
        { content: "Bị ẩn", postId: ids.moi!, authorId: minh.id, status: "HIDDEN" },
      ],
    });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe("GET /posts", () => {
    it("khách gọi được, chỉ có bài đã đăng, mới nhất trước, đúng định dạng phân trang", async () => {
      const res = await http().get("/api/v1/posts").expect(200);

      expect(slugsOf(res.body)).toEqual(["moi-nhat", "o-giua", "cu-hon"]);
      expect(res.body.meta).toEqual({ page: 1, pageSize: 10, total: 3, totalPages: 1 });
    });

    it("bài trong danh sách đủ trường, không có content, chỉ đếm bình luận đang hiện", async () => {
      const res = await http().get("/api/v1/posts").expect(200);
      const post = res.body.data[0];

      expect(post).toMatchObject({
        slug: "moi-nhat",
        commentCount: 1,
        author: { id: "lan", name: "Lan", username: "lan", image: null },
        category: { name: "Ẩm thực", slug: "am-thuc", color: "rose" },
        tags: [{ name: "Ăn vặt", slug: "an-vat" }],
      });
      expect(post).not.toHaveProperty("content");
      expect(post.author).not.toHaveProperty("email");
    });

    it("sort=top xếp theo lượt xem", async () => {
      const res = await http().get("/api/v1/posts?sort=top").expect(200);

      expect(slugsOf(res.body)).toEqual(["cu-hon", "o-giua", "moi-nhat"]);
    });

    it("phân trang: trang 2 với 2 bài/trang", async () => {
      const res = await http().get("/api/v1/posts?page=2&pageSize=2").expect(200);

      expect(slugsOf(res.body)).toEqual(["cu-hon"]);
      expect(res.body.meta).toEqual({ page: 2, pageSize: 2, total: 3, totalPages: 2 });
    });

    it.each([
      ["category=am-thuc", ["moi-nhat", "o-giua"]],
      ["tag=an-vat", ["moi-nhat"]],
      ["author=minh", ["cu-hon"]],
      ["author=lan&category=am-thuc", ["moi-nhat", "o-giua"]],
      ["category=", ["moi-nhat", "o-giua", "cu-hon"]],
      ["category=khong-co", []],
    ])("lọc %s", async (query, expected) => {
      const res = await http().get(`/api/v1/posts?${query}`).expect(200);

      expect(slugsOf(res.body)).toEqual(expected);
    });

    it("query sai thì 400 kèm lỗi từng trường", async () => {
      const res = await http().get("/api/v1/posts?sort=random&pageSize=500").expect(400);

      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(Object.keys(res.body.error.fields)).toEqual(
        expect.arrayContaining(["sort", "pageSize"]),
      );
    });
  });

  describe("GET /posts/:slug", () => {
    it("khách xem được bài đã đăng, có content và trạng thái", async () => {
      const res = await http().get("/api/v1/posts/moi-nhat").expect(200);

      expect(res.body.data).toMatchObject({
        slug: "moi-nhat",
        content: "Nội dung moi-nhat",
        status: "PUBLISHED",
        rejectReason: null,
      });
    });

    it("khách xem bản nháp thì 404, giống hệt bài không tồn tại", async () => {
      const draft = await http().get("/api/v1/posts/ban-nhap").expect(404);
      const missing = await http().get("/api/v1/posts/khong-ton-tai").expect(404);

      expect(draft.body).toEqual(missing.body);
      expect(draft.body.error.code).toBe("NOT_FOUND");
    });

    it("slug sai định dạng thì 404, không phải 400", async () => {
      await http()
        .get(`/api/v1/posts/${encodeURIComponent("bàn tròn")}`)
        .expect(404);
    });

    it("slug viết hoa thì 404: mỗi bài chỉ có một URL", async () => {
      await http().get("/api/v1/posts/Moi-Nhat").expect(404);
    });

    it("không trả email của tác giả", async () => {
      const res = await http().get("/api/v1/posts/moi-nhat").expect(200);

      expect(res.body.data.author).toEqual({
        id: "lan",
        name: "Lan",
        username: "lan",
        image: null,
      });
    });

    it("bài đã đăng: Vary theo cookie, không cấm cache", async () => {
      const res = await http().get("/api/v1/posts/moi-nhat").expect(200);

      expect(res.headers.vary).toMatch(/Cookie/i);
      expect(res.headers["cache-control"] ?? "").not.toMatch(/no-store/);
    });

    it("bài chưa đăng: tác giả nhận Cache-Control private, no-store", async () => {
      const { cookie, id } = await signUp("tacgia@test.local");
      await prisma.post.update({ where: { id: ids.nhap }, data: { authorId: id } });

      const res = await http().get("/api/v1/posts/ban-nhap").set("Cookie", cookie).expect(200);

      expect(res.headers["cache-control"]).toBe("private, no-store");
      expect(res.headers.vary).toMatch(/Cookie/i);
    });

    it("404 cũng có Vary: Cookie", async () => {
      const res = await http().get("/api/v1/posts/ban-nhap").expect(404);

      expect(res.headers.vary).toMatch(/Cookie/i);
    });

    it("tác giả đăng nhập xem được bản nháp của mình", async () => {
      const { cookie, id } = await signUp("tacgia@test.local");
      await prisma.post.update({ where: { id: ids.nhap }, data: { authorId: id } });

      const res = await http().get("/api/v1/posts/ban-nhap").set("Cookie", cookie).expect(200);

      expect(res.body.data.status).toBe("DRAFT");
    });

    it("cây bút xem được bài chờ duyệt của mình", async () => {
      const { cookie, id } = await signUp("caybut@test.local", "author");
      await prisma.post.update({ where: { id: ids.cho }, data: { authorId: id } });

      const res = await http().get("/api/v1/posts/cho-duyet").set("Cookie", cookie).expect(200);

      expect(res.body.data.status).toBe("PENDING");
    });

    it("tác giả bị cấm xem bản nháp của mình thì 404, như khách", async () => {
      const { cookie, id } = await signUp("bicam@test.local");
      await prisma.post.update({ where: { id: ids.nhap }, data: { authorId: id } });
      await prisma.user.update({ where: { id }, data: { banned: true, banReason: "spam" } });

      const res = await http().get("/api/v1/posts/ban-nhap").set("Cookie", cookie).expect(404);

      expect(res.body.error.code).toBe("NOT_FOUND");
    });

    it("người bị cấm vẫn đọc được bài đã đăng", async () => {
      const { cookie, id } = await signUp("bicam2@test.local");
      await prisma.user.update({ where: { id }, data: { banned: true } });

      await http().get("/api/v1/posts/moi-nhat").set("Cookie", cookie).expect(200);
    });

    it("hàng xóm khác đăng nhập xem bài chờ duyệt thì 404", async () => {
      const { cookie } = await signUp("khac@test.local");

      await http().get("/api/v1/posts/cho-duyet").set("Cookie", cookie).expect(404);
    });

    it("trưởng xóm xem được bài chờ duyệt của người khác", async () => {
      const { cookie } = await signUp("truongxom@test.local", "admin");

      const res = await http().get("/api/v1/posts/cho-duyet").set("Cookie", cookie).expect(200);

      expect(res.body.data.status).toBe("PENDING");
    });
  });

  describe("POST /posts/:id/view", () => {
    it("tăng lượt xem, trả 204, không đổi updatedAt", async () => {
      await http().post(`/api/v1/posts/${ids.moi}/view`).expect(204);

      const post = await prisma.post.findUniqueOrThrow({ where: { id: ids.moi } });
      expect(post.viewCount).toBe(6);
      expect(post.updatedAt.toISOString()).toBe(new Date(base).toISOString());
    });

    it("bài chưa đăng thì 404 và không tăng lượt xem", async () => {
      await http().post(`/api/v1/posts/${ids.nhap}/view`).expect(404);

      const post = await prisma.post.findUniqueOrThrow({ where: { id: ids.nhap } });
      expect(post.viewCount).toBe(0);
    });

    it("id không tồn tại thì 404", async () => {
      await http().post("/api/v1/posts/khong-co/view").expect(404);
    });

    it("id sai dạng thì 404", async () => {
      await http()
        .post(`/api/v1/posts/${"x".repeat(65)}/view`)
        .expect(404);
    });
  });
});
