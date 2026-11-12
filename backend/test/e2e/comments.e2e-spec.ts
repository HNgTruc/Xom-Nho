import type { NestExpressApplication } from "@nestjs/platform-express";
import { COMMENT_MESSAGES, LIMITS } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };

/** Bình luận dưới bài (`/posts/:id/comments`, `/comments/:id`, docs/tinh-nang.md mục 3). */
describe("Bình luận (/api/v1/posts/:id/comments, /api/v1/comments/:id)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let minh: Account;
  let admin: Account;
  let postId: string;

  const http = () => request(app.getHttpServer());

  const comment = (who: Account, body: Record<string, unknown>, post = postId) =>
    http().post(`/api/v1/posts/${post}/comments`).set("Cookie", who.cookie).send(body);

  const list = (who: Account, post = postId) =>
    http().get(`/api/v1/posts/${post}/comments`).set("Cookie", who.cookie);

  async function createPost(authorId: string, status: "PUBLISHED" | "ARCHIVED", slug: string) {
    const category = await prisma.category.findFirstOrThrow();
    const post = await prisma.post.create({
      data: {
        title: "",
        slug,
        excerpt: "",
        content: "Chợ phiên sáng nay",
        contentFormat: "PLAIN",
        searchText: "",
        status,
        authorId,
        categoryId: category.id,
        publishedAt: new Date(),
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
    lan = await signUp(app, prisma, "lan@test.local");
    minh = await signUp(app, prisma, "minh@test.local");
    admin = await signUp(app, prisma, "admin@test.local", "admin");
    await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
    postId = await createPost(lan.id, "PUBLISHED", "cho-phien");
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe("POST /posts/:id/comments", () => {
    it("hàng xóm bình luận: 201, người viết là chính mình, nội dung đã cắt khoảng trắng", async () => {
      const res = await comment(minh, { content: "  Sáng mai đi cùng nhé!\n7 giờ  " }).expect(201);

      expect(res.body.data).toEqual({
        id: expect.any(String),
        postId,
        parentId: null,
        content: "Sáng mai đi cùng nhé!\n7 giờ",
        author: { id: minh.id, name: "minh", username: "minh", image: null, avatarId: null },
        status: "VISIBLE",
        createdAt: expect.any(String),
        editedAt: null,
      });
    });

    it("không tin authorId, status client gửi lên", async () => {
      const res = await comment(minh, { content: "ok", authorId: lan.id, status: "HIDDEN" }).expect(
        201,
      );

      expect(res.body.data).toMatchObject({ status: "VISIBLE", author: { id: minh.id } });
    });

    it("trả lời một trả lời thì vẫn nằm trong nhánh của bình luận gốc", async () => {
      const root = (await comment(admin, { content: "Ai đi chợ không?" }).expect(201)).body.data;
      const reply = (await comment(minh, { content: "Mình!", parentId: root.id }).expect(201)).body
        .data;

      const res = await comment(lan, { content: "@minh hẹn 7 giờ", parentId: reply.id }).expect(
        201,
      );

      expect(res.body.data.parentId).toBe(root.id);
    });

    it("trả lời bình luận của bài khác thì 400 ở ô parentId", async () => {
      const other = await createPost(lan.id, "PUBLISHED", "bai-khac");
      const foreign = (await comment(lan, { content: "bên kia" }, other).expect(201)).body.data;

      const res = await comment(minh, { content: "ok", parentId: foreign.id }).expect(400);

      expect(res.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
        fields: { parentId: COMMENT_MESSAGES.PARENT_GONE },
      });
    });

    it.each([
      ["rỗng", { content: "   " }, COMMENT_MESSAGES.EMPTY],
      ["quá dài", { content: "a".repeat(LIMITS.COMMENT_MAX + 1) }, COMMENT_MESSAGES.TOO_LONG],
    ])("nội dung %s thì 400 báo tiếng Việt", async (_, body, message) => {
      const res = await comment(minh, body).expect(400);

      expect(res.body.error.fields.content).toBe(message);
    });

    it("bài không có thì 404", async () => {
      await comment(minh, { content: "ok" }, "khong-co-bai-nay").expect(404);
    });

    it("bài đã bị ẩn: người khác 404, chủ bài 403 (bài không nhận bình luận)", async () => {
      const archived = await createPost(lan.id, "ARCHIVED", "bai-an");

      await comment(minh, { content: "ok" }, archived).expect(404);
      const res = await comment(lan, { content: "ok" }, archived).expect(403);
      expect(res.body.error.message).toBe(COMMENT_MESSAGES.POST_CLOSED);
    });

    it("gửi bình luận thứ hai trong vòng 10 giây thì 429 (docs/api.md)", async () => {
      await comment(minh, { content: "lần 1" }).expect(201);

      const res = await comment(minh, { content: "lần 2" }).expect(429);

      expect(res.body.error.message).toBe(COMMENT_MESSAGES.RATE_LIMITED);
    });

    it("chưa đăng nhập thì 401", async () => {
      await http().post(`/api/v1/posts/${postId}/comments`).send({ content: "ok" }).expect(401);
    });
  });

  describe("GET /posts/:id/comments", () => {
    it("trả nhánh bình luận cũ trước, không cho cache dùng chung", async () => {
      const first = (await comment(lan, { content: "Một" }).expect(201)).body.data;
      await comment(minh, { content: "Hai" }).expect(201);
      await comment(admin, { content: "Trả lời một", parentId: first.id }).expect(201);

      const res = await list(minh).expect(200);

      expect(res.headers["cache-control"]).toBe("private, no-store");
      expect(
        res.body.data.map((t: { content: string; replies: { content: string }[] }) => [
          t.content,
          t.replies.map((r) => r.content),
        ]),
      ).toEqual([
        ["Một", ["Trả lời một"]],
        ["Hai", []],
      ]);
    });

    it("bình luận đã ẩn: người thường không thấy (cả nhánh), trưởng xóm thấy kèm status", async () => {
      const root = (await comment(lan, { content: "Bị ẩn" }).expect(201)).body.data;
      await comment(minh, { content: "Trả lời", parentId: root.id }).expect(201);
      await prisma.comment.update({ where: { id: root.id }, data: { status: "HIDDEN" } });

      expect((await list(minh).expect(200)).body.data).toEqual([]);
      expect((await list(lan).expect(200)).body.data).toEqual([]);
      const forAdmin = (await list(admin).expect(200)).body.data;
      expect(forAdmin).toHaveLength(1);
      expect(forAdmin[0]).toMatchObject({ status: "HIDDEN", replies: [{ content: "Trả lời" }] });
    });

    it("bài đã bị ẩn: người khác 404", async () => {
      const archived = await createPost(lan.id, "ARCHIVED", "bai-an");

      await list(minh, archived).expect(404);
      await list(lan, archived).expect(200);
    });
  });

  describe("PATCH, DELETE /comments/:id", () => {
    it("người viết sửa được, có editedAt; ẩn/hiện của admin không làm hiện 'đã sửa'", async () => {
      const created = (await comment(minh, { content: "Ban đầu" }).expect(201)).body.data;
      await prisma.comment.update({ where: { id: created.id }, data: { status: "HIDDEN" } });
      await prisma.comment.update({ where: { id: created.id }, data: { status: "VISIBLE" } });
      expect((await list(minh)).body.data[0].editedAt).toBeNull();

      const res = await http()
        .patch(`/api/v1/comments/${created.id}`)
        .set("Cookie", minh.cookie)
        .send({ content: "Đã sửa lại" })
        .expect(200);

      expect(res.body.data).toMatchObject({ content: "Đã sửa lại", editedAt: expect.any(String) });
    });

    it.each([
      ["hàng xóm khác", () => lan],
      ["trưởng xóm", () => admin],
    ])("%s sửa, xóa bình luận của người khác thì 403", async (_, who) => {
      const created = (await comment(minh, { content: "Của Minh" }).expect(201)).body.data;

      await http()
        .patch(`/api/v1/comments/${created.id}`)
        .set("Cookie", who().cookie)
        .send({ content: "x" })
        .expect(403);
      await http().delete(`/api/v1/comments/${created.id}`).set("Cookie", who().cookie).expect(403);
      expect(await prisma.comment.count()).toBe(1);
    });

    it("xóa bình luận gốc thì trả lời bị xóa theo; 204", async () => {
      const root = (await comment(minh, { content: "Gốc" }).expect(201)).body.data;
      await comment(lan, { content: "Trả lời", parentId: root.id }).expect(201);

      await http().delete(`/api/v1/comments/${root.id}`).set("Cookie", minh.cookie).expect(204);

      expect(await prisma.comment.count()).toBe(0);
    });

    it("bình luận đã bị ẩn: người viết nhận 404", async () => {
      const created = (await comment(minh, { content: "Sắp bị ẩn" }).expect(201)).body.data;
      await prisma.comment.update({ where: { id: created.id }, data: { status: "HIDDEN" } });

      await http().delete(`/api/v1/comments/${created.id}`).set("Cookie", minh.cookie).expect(404);
    });

    it("bình luận không có thì 404", async () => {
      await http().delete("/api/v1/comments/khong-co").set("Cookie", minh.cookie).expect(404);
    });
  });
});
