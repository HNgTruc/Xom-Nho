import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };

/** Bài của tôi (`GET /me/posts`), mọi trạng thái, docs/tinh-nang.md mục 1.3. */
describe("Bài của tôi (/api/v1/me/posts)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let minh: Account;
  let admin: Account;

  const http = () => request(app.getHttpServer());
  const createPost = async (who: Account, content: string) =>
    (
      await http()
        .post("/api/v1/posts")
        .set("Cookie", who.cookie)
        .send({ category: "doi-song", content })
        .expect(201)
    ).body.data as { id: string };
  const myPosts = async (who: Account, query = "") =>
    (await http().get(`/api/v1/me/posts${query}`).set("Cookie", who.cookie).expect(200)).body;

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
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it("có cả bài bị trưởng xóm ẩn, kèm trạng thái và lý do; mới tạo trước", async () => {
    const first = await createPost(lan, "Bài đầu tiên của Lan");
    const second = await createPost(lan, "Bài thứ hai của Lan");
    await http()
      .post(`/api/v1/admin/posts/${first.id}/archive`)
      .set("Cookie", admin.cookie)
      .send({ reason: "Quảng cáo, rao vặt" })
      .expect(200);

    const body = await myPosts(lan);

    expect(body.meta.total).toBe(2);
    expect(body.data.map((post: { id: string }) => post.id)).toEqual([second.id, first.id]);
    expect(body.data[0]).toMatchObject({ status: "PUBLISHED", rejectReason: null });
    expect(body.data[1]).toMatchObject({
      status: "ARCHIVED",
      rejectReason: "Quảng cáo, rao vặt",
      createdAt: expect.any(String),
      likeCount: 0,
      latestComments: [],
    });
  });

  it("lọc theo trạng thái", async () => {
    const hidden = await createPost(lan, "Bài sẽ bị ẩn");
    await createPost(lan, "Bài vẫn hiện");
    await http()
      .post(`/api/v1/admin/posts/${hidden.id}/archive`)
      .set("Cookie", admin.cookie)
      .send({ reason: "Lời lẽ xúc phạm" })
      .expect(200);

    const body = await myPosts(lan, "?status=ARCHIVED");

    expect(body.data.map((post: { id: string }) => post.id)).toEqual([hidden.id]);
    await http().get("/api/v1/me/posts?status=archived").set("Cookie", lan.cookie).expect(400);
  });

  it("chỉ có bài của chính mình", async () => {
    await createPost(lan, "Bài của Lan");

    expect((await myPosts(minh)).data).toEqual([]);
  });

  it("khách: 401", async () => {
    await http().get("/api/v1/me/posts").expect(401);
  });
});
