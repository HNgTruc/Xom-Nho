import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { EMPTY_POST_MESSAGE, FILE_MESSAGES, POST_MESSAGES } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);

/** File tải lên trong test nằm ở UPLOAD_DIR tạm (vitest.config.e2e.ts). */
const onDisk = (storageKey: string) => existsSync(join(process.env.UPLOAD_DIR ?? "", storageKey));

/** Sửa, xóa bài của mình (`PATCH`, `DELETE /posts/:id`, docs/tinh-nang.md mục 2.3). */
describe("Sửa, xóa bài (/api/v1/posts/:id)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let minh: Account;
  let admin: Account;

  const http = () => request(app.getHttpServer());

  const upload = async (who: Account) =>
    (
      await http()
        .post("/api/v1/files")
        .set("Cookie", who.cookie)
        .attach("file", PNG, { filename: "anh.png", contentType: "image/png" })
        .expect(201)
    ).body.data.id as string;

  const createPost = async (who: Account, body: Record<string, unknown>) =>
    (
      await http()
        .post("/api/v1/posts")
        .set("Cookie", who.cookie)
        .send({ category: "doi-song", ...body })
        .expect(201)
    ).body.data as { id: string; slug: string };

  const patch = (who: Account, id: string, body: Record<string, unknown>) =>
    http().patch(`/api/v1/posts/${id}`).set("Cookie", who.cookie).send(body);

  const remove = (who: Account, id: string) =>
    http().delete(`/api/v1/posts/${id}`).set("Cookie", who.cookie);

  const keyOf = async (mediaId: string) =>
    (await prisma.media.findUniqueOrThrow({ where: { id: mediaId } })).storageKey;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    lan = await signUp(app, prisma, "lan@test.local");
    minh = await signUp(app, prisma, "minh@test.local");
    admin = await signUp(app, prisma, "admin@test.local", "admin");
    await prisma.category.createMany({
      data: [
        { name: "Đời sống", slug: "doi-song" },
        { name: "Hỏi đáp", slug: "hoi-dap" },
      ],
    });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe("PATCH /posts/:id", () => {
    it("tác giả sửa tiêu đề, nội dung, danh mục: slug giữ nguyên, tóm tắt tính lại", async () => {
      const post = await createPost(lan, { title: "Chợ phiên", content: "Sáng mai" });

      const res = await patch(lan, post.id, {
        title: "Chợ phiên Tết",
        content: "  Sáng mai 7 giờ\nnhớ mang giỏ  ",
        category: "hoi-dap",
      }).expect(200);

      expect(res.body.data).toMatchObject({
        id: post.id,
        slug: post.slug,
        title: "Chợ phiên Tết",
        content: "Sáng mai 7 giờ\nnhớ mang giỏ",
        excerpt: "Sáng mai 7 giờ nhớ mang giỏ",
        category: { slug: "hoi-dap" },
        status: "PUBLISHED",
      });
      // Tìm kiếm thấy theo chữ mới
      const search = await http()
        .get("/api/v1/search?q=tet")
        .set("Cookie", minh.cookie)
        .expect(200);
      expect(search.body.data.map((p: { id: string }) => p.id)).toContain(post.id);
    });

    it("đổi ảnh: gỡ file cũ (xóa cả trên đĩa), thêm file mới, đổi thứ tự", async () => {
      const [a, b, c] = [await upload(lan), await upload(lan), await upload(lan)];
      const post = await createPost(lan, { content: "Ảnh chợ", mediaIds: [a, b] });
      const keyA = await keyOf(a);

      const res = await patch(lan, post.id, { mediaIds: [c, b] }).expect(200);

      expect(res.body.data.media.map((m: { id: string }) => m.id)).toEqual([c, b]);
      expect(await prisma.media.findUnique({ where: { id: a } })).toBeNull();
      expect(onDisk(keyA)).toBe(false);
      expect(onDisk(await keyOf(c))).toBe(true);
    });

    it("thêm ảnh của người khác thì 400, không đổi gì (rollback, ảnh cũ còn nguyên)", async () => {
      const mine = await upload(lan);
      const theirs = await upload(minh);
      const post = await createPost(lan, { content: "Ảnh chợ", mediaIds: [mine] });

      const res = await patch(lan, post.id, { mediaIds: [theirs] }).expect(400);

      expect(res.body.error.fields).toEqual({ mediaIds: FILE_MESSAGES.NOT_ATTACHABLE });
      expect((await prisma.media.findUniqueOrThrow({ where: { id: mine } })).postId).toBe(post.id);
      expect(onDisk(await keyOf(mine))).toBe(true);
      expect((await prisma.media.findUniqueOrThrow({ where: { id: theirs } })).postId).toBeNull();
    });

    it("thêm ảnh đại diện của mình vào bài thì 400", async () => {
      const post = await createPost(lan, { content: "Bài" });
      const avatarId = (
        await http()
          .put("/api/v1/me/avatar")
          .set("Cookie", lan.cookie)
          .attach("file", PNG, { filename: "mat.png", contentType: "image/png" })
          .expect(200)
      ).body.data.avatarId as string;

      await patch(lan, post.id, { mediaIds: [avatarId] }).expect(400);

      expect(await prisma.media.findUniqueOrThrow({ where: { id: avatarId } })).toMatchObject({
        purpose: "AVATAR",
        postId: null,
      });
    });

    it("ảnh đang gắn bài khác của chính mình thì 400", async () => {
      const image = await upload(lan);
      await createPost(lan, { content: "Bài một", mediaIds: [image] });
      const second = await createPost(lan, { content: "Bài hai" });

      await patch(lan, second.id, { mediaIds: [image] }).expect(400);
    });

    it.each([
      [{}, undefined, "Bạn chưa thay đổi gì"],
      [{ category: "khong-co" }, "category", undefined],
      [{ content: "" }, "content", EMPTY_POST_MESSAGE],
      [{ content: "", mediaIds: [] }, "content", EMPTY_POST_MESSAGE],
    ])("dữ liệu %j thì 400", async (body, field, message) => {
      const post = await createPost(lan, { content: "Chỉ có chữ" });

      const res = await patch(lan, post.id, body).expect(400);

      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      if (field) expect(res.body.error.fields).toHaveProperty(field);
      if (message) expect(JSON.stringify(res.body.error)).toContain(message);
    });

    it.each([
      ["hàng xóm khác", () => minh],
      ["trưởng xóm (sửa bài người khác bằng route admin)", () => admin],
    ])("%s sửa bài của Lan thì 403", async (_, who) => {
      const post = await createPost(lan, { content: "Của Lan" });

      const res = await patch(who(), post.id, { content: "Sửa trộm" }).expect(403);

      expect(res.body.error.message).toBe(POST_MESSAGES.NOT_OWNER);
      expect((await prisma.post.findUniqueOrThrow({ where: { id: post.id } })).content).toBe(
        "Của Lan",
      );
    });

    it("bài bị ẩn: tác giả vẫn sửa được (vẫn ẩn), người khác 404", async () => {
      const post = await createPost(lan, { content: "Sắp bị ẩn" });
      await prisma.post.update({ where: { id: post.id }, data: { status: "ARCHIVED" } });

      await patch(minh, post.id, { content: "x" }).expect(404);
      const res = await patch(lan, post.id, { content: "Đã sửa lại" }).expect(200);
      expect(res.body.data.status).toBe("ARCHIVED");
    });

    it("bài không có thì 404, chưa đăng nhập thì 401", async () => {
      await patch(lan, "khong-co-bai-nay", { content: "x" }).expect(404);
      await http().patch("/api/v1/posts/khong-co").send({ content: "x" }).expect(401);
    });
  });

  describe("DELETE /posts/:id", () => {
    it("tác giả xóa: 204, mất bài, bình luận, dòng media và file trên đĩa", async () => {
      const image = await upload(lan);
      const post = await createPost(lan, { content: "Sắp xóa", mediaIds: [image] });
      const key = await keyOf(image);
      await http()
        .post(`/api/v1/posts/${post.id}/comments`)
        .set("Cookie", minh.cookie)
        .send({ content: "Bình luận" })
        .expect(201);

      await remove(lan, post.id).expect(204);

      expect(await prisma.post.count()).toBe(0);
      expect(await prisma.comment.count()).toBe(0);
      expect(await prisma.media.count()).toBe(0);
      expect(onDisk(key)).toBe(false);
      await http().get(`/api/v1/posts/${post.slug}`).set("Cookie", lan.cookie).expect(404);
    });

    it("xóa bài không đụng ảnh đại diện của tác giả", async () => {
      const avatarId = (
        await http()
          .put("/api/v1/me/avatar")
          .set("Cookie", lan.cookie)
          .attach("file", PNG, { filename: "mat.png", contentType: "image/png" })
          .expect(200)
      ).body.data.avatarId as string;
      const post = await createPost(lan, { content: "Bài" });

      await remove(lan, post.id).expect(204);

      expect(await prisma.media.findUnique({ where: { id: avatarId } })).not.toBeNull();
    });

    it.each([
      ["hàng xóm khác", () => minh],
      ["trưởng xóm", () => admin],
    ])("%s xóa bài của Lan thì 403, bài còn nguyên", async (_, who) => {
      const post = await createPost(lan, { content: "Của Lan" });

      await remove(who(), post.id).expect(403);

      expect(await prisma.post.count()).toBe(1);
    });

    it("xóa lại bài đã xóa thì 404", async () => {
      const post = await createPost(lan, { content: "Bài" });
      await remove(lan, post.id).expect(204);

      await remove(lan, post.id).expect(404);
    });
  });
});
