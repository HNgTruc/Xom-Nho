import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

/**
 * Khách chỉ được đăng ký, đăng nhập (ADR 0007, docs/phan-quyen.md): mọi route đọc dữ liệu trả 401,
 * người bị cấm trả 403. Chỉ `/health` và `/auth/providers` (trang đăng nhập cần) còn mở.
 */
describe("Khách và người bị cấm (/api/v1)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let postId: string;

  const http = () => request(app.getHttpServer());

  /** Route đọc dữ liệu; `:id` thay bằng id bài lúc chạy. */
  const readRoutes: [method: "get" | "post", path: string][] = [
    ["get", "/api/v1/posts"],
    ["get", "/api/v1/posts/bai-da-dang"],
    ["post", "/api/v1/posts/:id/view"],
    ["get", "/api/v1/categories"],
    ["get", "/api/v1/tags"],
    ["get", "/api/v1/tags/an-vat"],
    ["get", "/api/v1/users/lan"],
    ["get", "/api/v1/search?q=bai"],
  ];
  const call = (method: "get" | "post", path: string) =>
    http()[method](path.replace(":id", postId));

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    await prisma.user.create({
      data: { id: "lan", name: "Lan", email: "lan@test.local", username: "lan" },
    });
    const category = await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
    await prisma.tag.create({ data: { name: "Ăn vặt", slug: "an-vat" } });
    const post = await prisma.post.create({
      data: {
        title: "Bài đã đăng",
        slug: "bai-da-dang",
        excerpt: "",
        content: "",
        searchText: "bai da dang",
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: "lan",
        categoryId: category.id,
      },
    });
    postId = post.id;
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it.each(readRoutes)("khách %s %s: 401", async (method, path) => {
    const res = await call(method, path).expect(401);

    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("khách gọi đếm lượt xem thì không tăng lượt xem", async () => {
    await http().post(`/api/v1/posts/${postId}/view`).expect(401);

    const post = await prisma.post.findUniqueOrThrow({ where: { id: postId } });
    expect(post.viewCount).toBe(0);
  });

  it("khách nhận 401 không kèm dữ liệu bài", async () => {
    const res = await http().get("/api/v1/posts/bai-da-dang").expect(401);

    expect(JSON.stringify(res.body)).not.toContain("Bài đã đăng");
  });

  it.each(readRoutes)("người bị cấm %s %s: 403", async (method, path) => {
    const { cookie, id } = await signUp(app, prisma, "bicam@test.local");
    await prisma.user.update({ where: { id }, data: { banned: true, banReason: "spam" } });

    const res = await call(method, path).set("Cookie", cookie).expect(403);

    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("khách vẫn xem được cách đăng nhập đang bật (trang đăng nhập cần)", async () => {
    await http().get("/api/v1/auth/providers").expect(200);
  });

  it("khách vẫn gọi được /health", async () => {
    await http().get("/api/v1/health").expect(200);
  });
});
