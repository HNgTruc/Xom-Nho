import type { NestExpressApplication } from "@nestjs/platform-express";
import type { AdminDashboard } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };

const DAY_MS = 24 * 60 * 60 * 1000;

/** `YYYY-MM-DD` theo giờ Việt Nam (UTC+7), như backend tính. */
const vnDay = (instant: Date) =>
  new Date(instant.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Màn Tổng quan (`GET /api/v1/admin/dashboard`, docs/api.md mục "Tổng quan"). */
describe("Quản trị: Tổng quan (/api/v1/admin/dashboard)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let author: Account;
  let admin: Account;

  const call = (who: Account | null, method: "get" | "post", path: string, body?: object) => {
    const req = request(app.getHttpServer())[method](`/api/v1${path}`);
    if (who) req.set("Cookie", who.cookie);
    return body ? req.send(body) : req;
  };

  const createPost = async (who: Account, content: string) =>
    (
      await call(who, "post", "/posts", { category: "doi-song", title: content, content }).expect(
        201,
      )
    ).body.data as { id: string };

  const dashboard = async () =>
    (await call(admin, "get", "/admin/dashboard").expect(200)).body.data as AdminDashboard;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    lan = await signUp(app, prisma, "lan@test.local");
    author = await signUp(app, prisma, "caybut@test.local", "author");
    admin = await signUp(app, prisma, "admin@test.local", "admin");
    await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it("khách 401, hàng xóm và cây bút 403", async () => {
    await call(null, "get", "/admin/dashboard").expect(401);
    await call(lan, "get", "/admin/dashboard").expect(403);
    await call(author, "get", "/admin/dashboard").expect(403);
  });

  it("chưa có gì: đủ 30 ngày số 0, ngày cuối là hôm nay theo giờ Việt Nam", async () => {
    await prisma.user.updateMany({ data: { createdAt: new Date(Date.now() - 60 * DAY_MS) } });

    const data = await dashboard();

    expect(data.daily).toHaveLength(30);
    expect(data.daily.at(-1)?.date).toBe(vnDay(new Date()));
    expect(data.daily.every((day) => day.posts + day.comments + day.members === 0)).toBe(true);
    expect(data.recent.members).toEqual({ current: 0, previous: 0 });
    expect(data.hidden).toEqual({ posts: 0, comments: 0 });
  });

  it("đếm bài, bình luận, thành viên theo ngày; so 7 ngày; bỏ qua ngày ngoài 30 ngày", async () => {
    const today = await createPost(lan, "Bài hôm nay");
    const older = await createPost(author, "Bài tuần trước");
    const ancient = await createPost(author, "Bài hai tháng trước");
    await call(lan, "post", `/posts/${today.id}/comments`, { content: "Bình luận một" }).expect(
      201,
    );
    await call(author, "post", `/posts/${today.id}/comments`, { content: "Bình luận hai" }).expect(
      201,
    );
    const tenDaysAgo = new Date(Date.now() - 10 * DAY_MS);
    await prisma.post.update({ where: { id: older.id }, data: { createdAt: tenDaysAgo } });
    await prisma.post.update({
      where: { id: ancient.id },
      data: { createdAt: new Date(Date.now() - 60 * DAY_MS) },
    });
    await prisma.user.update({ where: { id: lan.id }, data: { createdAt: tenDaysAgo } });

    const data = await dashboard();

    const todayRow = data.daily.at(-1);
    expect(todayRow).toMatchObject({ posts: 1, comments: 2, members: 2 });
    expect(data.daily.find((day) => day.date === vnDay(tenDaysAgo))).toMatchObject({
      posts: 1,
      members: 1,
    });
    expect(data.recent).toEqual({
      posts: { current: 1, previous: 1 },
      comments: { current: 2, previous: 0 },
      members: { current: 2, previous: 1 },
    });
    // Bài hai tháng trước nằm ngoài biểu đồ
    expect(data.daily.reduce((total, day) => total + day.posts, 0)).toBe(2);
  });

  it("số đang ẩn: bài đã ẩn, bình luận đã ẩn; hiện lại thì không còn tính", async () => {
    const post = await createPost(lan, "Bài sẽ bị ẩn");
    const other = await createPost(author, "Bài khác");
    const comment = (
      await call(author, "post", `/posts/${other.id}/comments`, { content: "Sẽ bị ẩn" }).expect(201)
    ).body.data as { id: string };
    await call(admin, "post", `/admin/posts/${post.id}/archive`, { reason: "Spam" }).expect(200);
    await call(admin, "post", `/admin/comments/${comment.id}/hide`).expect(200);

    expect((await dashboard()).hidden).toEqual({ posts: 1, comments: 1 });

    await call(admin, "post", `/admin/posts/${post.id}/restore`).expect(200);
    expect((await dashboard()).hidden).toEqual({ posts: 0, comments: 1 });
  });
});
