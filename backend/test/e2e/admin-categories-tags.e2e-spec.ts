import type { NestExpressApplication } from "@nestjs/platform-express";
import { ADMIN_MESSAGES, type AdminCategory, type AdminTag } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };
type Method = "get" | "post" | "put" | "patch" | "delete";

const body = { name: "Đời sống", description: "Chuyện thường ngày", color: "amber", icon: "tea" };

/** Danh mục, thẻ trong trang quản trị (`/api/v1/admin/categories`, `/api/v1/admin/tags`, docs/api.md). */
describe("Quản trị: danh mục, thẻ", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let author: Account;
  let admin: Account;

  const call = (who: Account | null, method: Method, path: string, payload?: object) => {
    const req = request(app.getHttpServer())[method](`/api/v1${path}`);
    if (who) req.set("Cookie", who.cookie);
    return payload ? req.send(payload) : req;
  };

  const createCategory = async (payload: object = body) =>
    (await call(admin, "post", "/admin/categories", payload).expect(201)).body
      .data as AdminCategory;

  const createPost = async (categorySlug: string, title: string) =>
    (
      await call(lan, "post", "/posts", {
        category: categorySlug,
        title,
        content: `${title}, nội dung`,
      }).expect(201)
    ).body.data as { id: string };

  /** Gắn thẻ thẳng trong database (trình soạn bài chưa có ô thẻ). `searchText` chưa có tên thẻ: gộp, xóa sẽ tính lại. */
  const tagPost = async (postId: string, tagIds: string[]) => {
    await prisma.postTag.createMany({ data: tagIds.map((tagId) => ({ postId, tagId })) });
  };

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    lan = await signUp(app, prisma, "lan@test.local");
    author = await signUp(app, prisma, "caybut@test.local", "author");
    admin = await signUp(app, prisma, "admin@test.local", "admin");
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe("quyền", () => {
    const routes: [Method, string, object?][] = [
      ["get", "/admin/categories"],
      ["post", "/admin/categories", body],
      ["patch", "/admin/categories/c1", body],
      ["put", "/admin/categories/order", { ids: ["c1"] }],
      ["delete", "/admin/categories/c1"],
      ["get", "/admin/tags"],
      ["post", "/admin/tags/t1/merge", { targetId: "t2" }],
      ["delete", "/admin/tags/t1"],
    ];

    it.each(routes)("%s %s: khách 401, hàng xóm và cây bút 403", async (method, path, payload) => {
      await call(null, method, path, payload).expect(401);
      await call(lan, method, path, payload).expect(403);
      await call(author, method, path, payload).expect(403);
    });
  });

  describe("danh mục", () => {
    it("thêm: đường dẫn sinh từ tên, nằm cuối menu; GET /categories thấy ngay", async () => {
      await createCategory();
      const created = await createCategory({ ...body, name: "Hỏi đáp", icon: null });

      expect(created).toMatchObject({
        name: "Hỏi đáp",
        slug: "hoi-dap",
        icon: null,
        postCount: 0,
        totalPostCount: 0,
      });
      const publicList = (await call(lan, "get", "/categories").expect(200)).body.data as {
        slug: string;
      }[];
      expect(publicList.map((c) => c.slug)).toEqual(["doi-song", "hoi-dap"]);
    });

    it("tên trùng (kể cả khác dấu) thì 409 kèm lỗi ở ô tên", async () => {
      await createCategory();

      for (const name of ["Đời sống", "đời SỐNG", "Đời sông"]) {
        const res = await call(admin, "post", "/admin/categories", { ...body, name }).expect(409);
        expect(res.body.error).toMatchObject({
          code: "CONFLICT",
          fields: { name: ADMIN_MESSAGES.CATEGORY_NAME_TAKEN },
        });
      }
    });

    it("dữ liệu sai thì 400: tên rỗng, màu lạ", async () => {
      await call(admin, "post", "/admin/categories", { ...body, name: " " }).expect(400);
      await call(admin, "post", "/admin/categories", { ...body, color: "red" }).expect(400);
    });

    it("sửa: đổi tên, màu, biểu tượng; đường dẫn giữ nguyên", async () => {
      const category = await createCategory();

      const res = await call(admin, "patch", `/admin/categories/${category.id}`, {
        name: "Chuyện xóm",
        description: "",
        color: "green",
        icon: null,
      }).expect(200);

      expect(res.body.data).toMatchObject({
        name: "Chuyện xóm",
        slug: "doi-song",
        description: null,
        color: "green",
        icon: null,
      });
    });

    it("sắp xếp: lưu đúng thứ tự; thiếu một danh mục thì 409, giữ nguyên thứ tự cũ", async () => {
      const a = await createCategory();
      const b = await createCategory({ ...body, name: "Học tập" });
      const c = await createCategory({ ...body, name: "Hỏi đáp" });

      const res = await call(admin, "put", "/admin/categories/order", {
        ids: [c.id, a.id, b.id],
      }).expect(200);
      expect((res.body.data as AdminCategory[]).map((x) => x.id)).toEqual([c.id, a.id, b.id]);

      await call(admin, "put", "/admin/categories/order", { ids: [a.id, b.id] }).expect(409);
      const list = (await call(admin, "get", "/admin/categories").expect(200)).body
        .data as AdminCategory[];
      expect(list.map((x) => x.id)).toEqual([c.id, a.id, b.id]);
    });

    it("xóa: còn bài (kể cả bài đang ẩn) thì 409; hết bài thì xóa được", async () => {
      const category = await createCategory();
      const post = await createPost("doi-song", "Bài trong danh mục");
      await call(admin, "post", `/admin/posts/${post.id}/archive`, { reason: "Spam" }).expect(200);

      const list = (await call(admin, "get", "/admin/categories").expect(200)).body
        .data as AdminCategory[];
      expect(list[0]).toMatchObject({ postCount: 0, totalPostCount: 1 });
      const res = await call(admin, "delete", `/admin/categories/${category.id}`).expect(409);
      expect(res.body.error.message).toBe(ADMIN_MESSAGES.CATEGORY_HAS_POSTS);

      await call(admin, "delete", `/admin/posts/${post.id}`).expect(204);
      await call(admin, "delete", `/admin/categories/${category.id}`).expect(204);
      await call(admin, "delete", `/admin/categories/${category.id}`).expect(404);
    });
  });

  describe("thẻ", () => {
    let postA: { id: string };
    let postB: { id: string };
    let anVat: { id: string };
    let doAnVat: { id: string };
    let banhMi: { id: string };

    beforeEach(async () => {
      await createCategory();
      postA = await createPost("doi-song", "Bài A");
      postB = await createPost("doi-song", "Bài B");
      anVat = await prisma.tag.create({ data: { name: "ăn vặt", slug: "an-vat" } });
      doAnVat = await prisma.tag.create({ data: { name: "đồ ăn vặt", slug: "do-an-vat" } });
      banhMi = await prisma.tag.create({ data: { name: "bánh mì", slug: "banh-mi" } });
      // Bài A có cả hai thẻ trùng nghĩa, bài B chỉ có thẻ nguồn
      await tagPost(postA.id, [anVat.id, doAnVat.id, banhMi.id]);
      await tagPost(postB.id, [doAnVat.id]);
    });

    it("danh sách: nhiều bài trước; tìm không dấu ra thẻ có dấu", async () => {
      const all = (await call(admin, "get", "/admin/tags").expect(200)).body;
      expect((all.data as AdminTag[]).map((t) => [t.name, t.postCount])).toEqual([
        ["đồ ăn vặt", 2],
        ["ăn vặt", 1],
        ["bánh mì", 1],
      ]);
      expect(all.meta.total).toBe(3);

      const found = (await call(admin, "get", "/admin/tags?q=an%20vat").expect(200)).body
        .data as AdminTag[];
      expect(found.map((t) => t.name).sort()).toEqual(["ăn vặt", "đồ ăn vặt"]);
    });

    it("gộp: bài chuyển sang thẻ đích, bài có cả hai không bị lặp, thẻ nguồn mất, tìm kiếm tính lại", async () => {
      const res = await call(admin, "post", `/admin/tags/${doAnVat.id}/merge`, {
        targetId: anVat.id,
      }).expect(200);

      expect(res.body.data).toMatchObject({ id: anVat.id, postCount: 2 });
      expect(await prisma.tag.findUnique({ where: { id: doAnVat.id } })).toBeNull();
      const links = await prisma.postTag.findMany({ where: { tagId: anVat.id } });
      expect(links.map((l) => l.postId).sort()).toEqual([postA.id, postB.id].sort());

      const posts = await prisma.post.findMany({
        where: { id: { in: [postA.id, postB.id] } },
        select: { id: true, searchText: true },
      });
      const text = Object.fromEntries(posts.map((p) => [p.id, p.searchText]));
      expect(text[postB.id]).toContain("an vat");
      expect(text[postB.id]).not.toContain("do an vat");
      expect(text[postA.id]).toContain("banh mi");
    });

    it("gộp vào chính nó thì 400; thẻ đích không có thì 404", async () => {
      await call(admin, "post", `/admin/tags/${anVat.id}/merge`, { targetId: anVat.id }).expect(
        400,
      );
      await call(admin, "post", `/admin/tags/${anVat.id}/merge`, { targetId: "khongco" }).expect(
        404,
      );
    });

    it("xóa: gỡ khỏi bài, bài vẫn còn, tìm kiếm tính lại", async () => {
      await call(admin, "delete", `/admin/tags/${banhMi.id}`).expect(204);

      const post = await prisma.post.findUniqueOrThrow({
        where: { id: postA.id },
        select: { searchText: true },
      });
      expect(post.searchText).not.toContain("banh mi");
      expect(post.searchText).toContain("an vat");
      await call(admin, "delete", `/admin/tags/${banhMi.id}`).expect(404);
    });
  });
});
