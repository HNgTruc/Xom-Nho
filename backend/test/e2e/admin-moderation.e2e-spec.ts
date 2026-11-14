import type { NestExpressApplication } from "@nestjs/platform-express";
import { ADMIN_MESSAGES } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { AUTH } from "../../src/infrastructure/auth/auth.module.js";
import { type Auth, DISABLED_ADMIN_PATHS } from "../../src/infrastructure/auth/create-auth.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };
type Method = "get" | "post" | "put" | "patch" | "delete";

/**
 * Kiểm duyệt tối thiểu (`/api/v1/admin/*`, docs/api.md mục "Quản trị"): ẩn bài kèm lý do, ẩn bình luận,
 * đổi vai trò, cấm thành viên. Chạy qua AuthGuard, RolesGuard thật.
 */
describe("Quản trị: bài viết, bình luận, thành viên (/api/v1/admin)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let minh: Account;
  let author: Account;
  let admin: Account;

  const http = () => request(app.getHttpServer());
  const call = (who: Account | null, method: Method, path: string, body?: object) => {
    const req = http()[method](`/api/v1${path}`);
    if (who) req.set("Cookie", who.cookie);
    return body ? req.send(body) : req;
  };

  const createPost = async (who: Account, content: string) =>
    (
      await call(who, "post", "/posts", { category: "doi-song", title: content, content }).expect(
        201,
      )
    ).body.data as { id: string; slug: string };

  const comment = async (who: Account, postId: string, content: string) =>
    (await call(who, "post", `/posts/${postId}/comments`, { content }).expect(201)).body.data as {
      id: string;
    };

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    lan = await signUp(app, prisma, "lan@test.local");
    minh = await signUp(app, prisma, "minh@test.local");
    author = await signUp(app, prisma, "caybut@test.local", "author");
    admin = await signUp(app, prisma, "admin@test.local", "admin");
    await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe("route admin có sẵn của Better Auth (/api/auth/admin/*) đã tắt", () => {
    it("trưởng xóm gọi bằng GET hay POST đều nhận 404, kể cả tự hạ vai trò", async () => {
      for (const path of DISABLED_ADMIN_PATHS) {
        await http().get(`/api/auth${path}`).set("Cookie", admin.cookie).expect(404);
        await http()
          .post(`/api/auth${path}`)
          .set("Cookie", admin.cookie)
          .set("Origin", "http://localhost:3000")
          .send({ userId: admin.id, role: "user" })
          .expect(404);
      }
      const me = await prisma.user.findUniqueOrThrow({ where: { id: admin.id } });
      expect(me.role).toBe("admin");
    });

    it("danh sách tắt gồm mọi route /admin/* của plugin (nâng bản Better Auth thì so lại)", () => {
      const endpoints = Object.values(app.get<Auth>(AUTH).api) as { path?: string }[];
      const pluginPaths = endpoints
        .map((endpoint) => endpoint.path)
        .filter((path): path is string => typeof path === "string" && path.startsWith("/admin/"));

      expect(pluginPaths.length).toBeGreaterThan(0);
      expect([...new Set(pluginPaths)].sort()).toEqual([...DISABLED_ADMIN_PATHS].sort());
    });

    it("hook của plugin vẫn chạy: người bị cấm không đăng nhập được", async () => {
      await call(admin, "post", `/admin/users/${lan.id}/ban`, { reason: "Spam" }).expect(200);

      const res = await http()
        .post("/api/auth/sign-in/email")
        .set("Origin", "http://localhost:3000")
        .send({ email: "lan@test.local", password: "matkhau123" });

      expect(res.status).toBe(403);
    });
  });

  describe("chỉ trưởng xóm gọi được", () => {
    const routes: [Method, string, object?][] = [
      ["get", "/admin/posts"],
      ["get", "/admin/posts/stats"],
      ["post", "/admin/posts/p1/archive", { reason: "Spam" }],
      ["post", "/admin/posts/p1/restore"],
      ["delete", "/admin/posts/p1"],
      ["get", "/admin/comments"],
      ["post", "/admin/comments/c1/hide"],
      ["post", "/admin/comments/c1/show"],
      ["delete", "/admin/comments/c1"],
      ["get", "/admin/users"],
      ["get", "/admin/users/stats"],
      ["get", "/admin/users/u1"],
      ["patch", "/admin/users/u1/role", { role: "admin" }],
      ["post", "/admin/users/u1/ban", { reason: "Spam" }],
      ["post", "/admin/users/u1/unban"],
    ];

    it.each(routes)("%s %s: khách 401, hàng xóm và cây bút 403", async (method, path, body) => {
      await call(null, method, path, body).expect(401);
      await call(lan, method, path, body).expect(403);
      await call(author, method, path, body).expect(403);
    });
  });

  describe("bài viết", () => {
    it("danh sách có mọi trạng thái; since + oldest cho màn Bài mới", async () => {
      const old = await createPost(lan, "Bài cũ");
      await prisma.post.update({
        where: { id: old.id },
        data: { createdAt: new Date("2026-01-01T00:00:00.000Z"), status: "ARCHIVED" },
      });
      const first = await createPost(lan, "Bài mới một");
      const second = await createPost(minh, "Bài mới hai");

      const all = await call(admin, "get", "/admin/posts").expect(200);
      expect(all.body.meta.total).toBe(3);

      const fresh = await call(
        admin,
        "get",
        "/admin/posts?since=2026-06-01T00:00:00.000Z&sort=oldest",
      ).expect(200);
      expect(fresh.body.data.map((p: { id: string }) => p.id)).toEqual([first.id, second.id]);
      expect(fresh.body.meta.total).toBe(2);
    });

    it("tìm có dấu hay không dấu đều ra", async () => {
      await createPost(lan, "Bánh mì đầu hẻm");
      await createPost(lan, "Trà sữa");

      const res = await call(admin, "get", "/admin/posts?q=banh%20mi").expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Bánh mì đầu hẻm");
    });

    it("ẩn kèm lý do: tác giả thấy lý do, người khác không thấy bài; hiện lại thì xóa lý do", async () => {
      const post = await createPost(lan, "Bán đất nền giá rẻ");

      const archived = await call(admin, "post", `/admin/posts/${post.id}/archive`, {
        reason: "  Quảng cáo, rao vặt ",
      }).expect(200);
      expect(archived.body.data).toMatchObject({
        status: "ARCHIVED",
        rejectReason: "Quảng cáo, rao vặt",
      });

      const own = await call(lan, "get", `/posts/${post.slug}`).expect(200);
      expect(own.body.data).toMatchObject({
        status: "ARCHIVED",
        rejectReason: "Quảng cáo, rao vặt",
      });
      await call(minh, "get", `/posts/${post.slug}`).expect(404);
      const feed = await call(minh, "get", "/posts").expect(200);
      expect(feed.body.data).toHaveLength(0);

      const restored = await call(admin, "post", `/admin/posts/${post.id}/restore`).expect(200);
      expect(restored.body.data).toMatchObject({ status: "PUBLISHED", rejectReason: null });
      await call(minh, "get", `/posts/${post.slug}`).expect(200);
    });

    it("ẩn không có lý do: 400; ẩn bài đang ẩn, hiện bài đang hiện: 409", async () => {
      const post = await createPost(lan, "Chợ phiên");

      const missing = await call(admin, "post", `/admin/posts/${post.id}/archive`, {
        reason: " ",
      }).expect(400);
      expect(missing.body.error.fields.reason).toBe(ADMIN_MESSAGES.HIDE_REASON_REQUIRED);

      await call(admin, "post", `/admin/posts/${post.id}/restore`).expect(409);
      await call(admin, "post", `/admin/posts/${post.id}/archive`, { reason: "Spam" }).expect(200);
      const again = await call(admin, "post", `/admin/posts/${post.id}/archive`, {
        reason: "Spam",
      }).expect(409);
      expect(again.body.error.message).toBe(ADMIN_MESSAGES.POST_NOT_PUBLISHED);
    });

    it("xóa bài của người khác; bài không có: 404", async () => {
      const post = await createPost(lan, "Sẽ bị xóa");
      await comment(minh, post.id, "Ủa sao vậy");

      await call(admin, "delete", `/admin/posts/${post.id}`).expect(204);

      expect(await prisma.post.count()).toBe(0);
      expect(await prisma.comment.count()).toBe(0);
      await call(admin, "delete", `/admin/posts/${post.id}`).expect(404);
    });
  });

  describe("bảng xếp hạng và thẻ số liệu (màn Bài viết)", () => {
    const DAY = 24 * 60 * 60 * 1000;

    /** Ba bài: a nhiều thích, b nhiều không thích và lượt xem, c nhiều bình luận. */
    async function seedRanking() {
      const a = await createPost(lan, "Bài A");
      const b = await createPost(lan, "Bài B");
      const c = await createPost(minh, "Bài C");
      for (const who of [lan, minh, author]) {
        await call(who, "put", `/posts/${a.id}/like`).expect(200);
      }
      for (const who of [lan, minh]) {
        await call(who, "put", `/posts/${b.id}/dislike`).expect(200);
      }
      await prisma.post.update({ where: { id: b.id }, data: { viewCount: 50 } });
      await prisma.comment.createMany({
        data: [lan, minh, author].map((who) => ({
          postId: c.id,
          authorId: who.id,
          content: "Góp ý",
        })),
      });
      return { a, b, c };
    }

    const ids = (res: request.Response) => res.body.data.map((p: { id: string }) => p.id);

    it.each([
      ["likes", "a"],
      ["dislikes", "b"],
      ["comments", "c"],
      ["views", "b"],
    ] as const)("sort=%s: bài cao nhất đứng đầu, order=asc thì đứng cuối", async (sort, top) => {
      const posts = await seedRanking();

      const desc = await call(admin, "get", `/admin/posts?sort=${sort}`).expect(200);
      expect(ids(desc)[0]).toBe(posts[top].id);

      const asc = await call(admin, "get", `/admin/posts?sort=${sort}&order=asc`).expect(200);
      expect(ids(asc).at(-1)).toBe(posts[top].id);
    });

    it("dòng bảng có số không thích", async () => {
      const { b } = await seedRanking();

      const res = await call(admin, "get", "/admin/posts?sort=dislikes").expect(200);

      expect(res.body.data[0]).toMatchObject({ id: b.id, dislikeCount: 2, likeCount: 0 });
    });

    it("range=7d chỉ lấy bài đăng trong 7 ngày; pageSize=30 được", async () => {
      const recent = await createPost(lan, "Bài tuần này");
      const old = await createPost(lan, "Bài tháng trước");
      await prisma.post.update({
        where: { id: old.id },
        data: { createdAt: new Date(Date.now() - 20 * DAY) },
      });

      const week = await call(admin, "get", "/admin/posts?range=7d&pageSize=30").expect(200);
      expect(ids(week)).toEqual([recent.id]);
      const all = await call(admin, "get", "/admin/posts?range=all").expect(200);
      expect(all.body.meta.total).toBe(2);
    });

    it("stats: số bài trong khoảng so với khoảng trước, số theo trạng thái", async () => {
      const now = Date.now();
      const created = [1, 2, 10, 40, 45];
      for (const [i, daysAgo] of created.entries()) {
        const post = await createPost(lan, `Bài ${i}`);
        await prisma.post.update({
          where: { id: post.id },
          data: { createdAt: new Date(now - daysAgo * DAY) },
        });
      }
      const hidden = await createPost(minh, "Bài bị ẩn");
      await call(admin, "post", `/admin/posts/${hidden.id}/archive`, { reason: "Spam" }).expect(
        200,
      );

      const month = await call(admin, "get", "/admin/posts/stats").expect(200);
      // 30 ngày: 1, 2, 10 ngày trước + bài bị ẩn (vừa tạo); 30 ngày trước đó: 40, 45 ngày trước
      expect(month.body.data).toMatchObject({
        range: "30d",
        total: 4,
        previousTotal: 2,
        byStatus: { PUBLISHED: 5, ARCHIVED: 1, DRAFT: 0, PENDING: 0, REJECTED: 0 },
      });

      const week = await call(admin, "get", "/admin/posts/stats?range=7d").expect(200);
      expect(week.body.data).toMatchObject({ total: 3, previousTotal: 1 });

      const all = await call(admin, "get", "/admin/posts/stats?range=all").expect(200);
      expect(all.body.data).toMatchObject({ total: 6, previousTotal: null, from: null });

      await call(admin, "get", "/admin/posts/stats?range=1y").expect(400);
    });
  });

  describe("bình luận", () => {
    it("ẩn thì người khác, kể cả người viết, không thấy; hiện lại thì thấy", async () => {
      const post = await createPost(lan, "Hỏi đường");
      const c = await comment(minh, post.id, "Đi thẳng rồi quẹo trái");

      const hidden = await call(admin, "post", `/admin/comments/${c.id}/hide`).expect(200);
      expect(hidden.body.data).toMatchObject({ status: "HIDDEN", post: { id: post.id } });

      for (const who of [lan, minh]) {
        const res = await call(who, "get", `/posts/${post.id}/comments`).expect(200);
        expect(res.body.data).toHaveLength(0);
      }

      await call(admin, "post", `/admin/comments/${c.id}/show`).expect(200);
      const res = await call(lan, "get", `/posts/${post.id}/comments`).expect(200);
      expect(res.body.data).toHaveLength(1);
    });

    it("danh sách lọc theo trạng thái, có cả bình luận đã ẩn", async () => {
      const post = await createPost(lan, "Góp ý");
      const a = await comment(minh, post.id, "Hay");
      await prisma.comment.update({ where: { id: a.id }, data: { status: "HIDDEN" } });
      await prisma.comment.create({
        data: { postId: post.id, authorId: lan.id, content: "Cảm ơn" },
      });

      const all = await call(admin, "get", "/admin/comments").expect(200);
      expect(all.body.meta.total).toBe(2);
      const hidden = await call(admin, "get", "/admin/comments?status=HIDDEN").expect(200);
      expect(hidden.body.data.map((x: { id: string }) => x.id)).toEqual([a.id]);
    });

    it("xóa bình luận gốc thì trả lời bên dưới mất theo", async () => {
      const post = await createPost(lan, "Hỏi đáp");
      const root = await comment(minh, post.id, "Câu hỏi");
      await prisma.comment.create({
        data: { postId: post.id, authorId: lan.id, content: "Trả lời", parentId: root.id },
      });

      await call(admin, "delete", `/admin/comments/${root.id}`).expect(204);

      expect(await prisma.comment.count()).toBe(0);
    });
  });

  describe("thành viên", () => {
    it("danh sách có email, tìm theo email, lọc vai trò", async () => {
      const res = await call(admin, "get", "/admin/users?q=minh@").expect(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({ id: minh.id, email: "minh@test.local" });
      expect(res.body.data[0]).not.toHaveProperty("password");

      const authors = await call(admin, "get", "/admin/users?role=author").expect(200);
      expect(authors.body.data.map((u: { id: string }) => u.id)).toEqual([author.id]);
    });

    it("chi tiết một thành viên: số bài, bình luận, số đang bị ẩn; không có thì 404", async () => {
      const post = await createPost(lan, "Bài của Lan");
      const other = await createPost(lan, "Bài thứ hai");
      const c = await comment(lan, post.id, "Tự bình luận");
      await call(admin, "post", `/admin/posts/${other.id}/archive`, { reason: "Spam" }).expect(200);
      await call(admin, "post", `/admin/comments/${c.id}/hide`).expect(200);

      const res = await call(admin, "get", `/admin/users/${lan.id}`).expect(200);

      expect(res.body.data).toMatchObject({
        id: lan.id,
        email: "lan@test.local",
        role: "user",
        postCount: 2,
        commentCount: 1,
        hiddenPostCount: 1,
        hiddenCommentCount: 1,
      });
      await call(admin, "get", "/admin/users/khong-co").expect(404);
    });

    it("số liệu: tổng, người mới 7 ngày, theo vai trò, đang bị cấm", async () => {
      await prisma.user.update({
        where: { id: minh.id },
        data: { createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });
      await call(admin, "post", `/admin/users/${lan.id}/ban`, { reason: "Spam" }).expect(200);

      const res = await call(admin, "get", "/admin/users/stats").expect(200);

      // lan, minh (user), caybut (author), admin
      expect(res.body.data).toEqual({
        total: 4,
        newLast7Days: 3,
        byRole: { user: 2, author: 1, admin: 1 },
        banned: 1,
      });
    });

    it("đổi vai trò có hiệu lực ngay ở request sau", async () => {
      await call(lan, "get", "/admin/posts").expect(403);

      await call(admin, "patch", `/admin/users/${lan.id}/role`, { role: "admin" }).expect(200);

      await call(lan, "get", "/admin/posts").expect(200);
    });

    it("không tự đổi vai trò, không tự cấm, không cấm trưởng xóm khác", async () => {
      const other = await signUp(app, prisma, "admin2@test.local", "admin");

      const ownRole = await call(admin, "patch", `/admin/users/${admin.id}/role`, {
        role: "user",
      }).expect(403);
      expect(ownRole.body.error.message).toBe(ADMIN_MESSAGES.CANNOT_CHANGE_OWN_ROLE);

      const self = await call(admin, "post", `/admin/users/${admin.id}/ban`, {
        reason: "Thử",
      }).expect(403);
      expect(self.body.error.message).toBe(ADMIN_MESSAGES.CANNOT_BAN_SELF);

      const peer = await call(admin, "post", `/admin/users/${other.id}/ban`, {
        reason: "Thử",
      }).expect(403);
      expect(peer.body.error.message).toBe(ADMIN_MESSAGES.CANNOT_BAN_ADMIN);

      // Hạ vai trò trưởng xóm khác thì được, rồi mới cấm được
      await call(admin, "patch", `/admin/users/${other.id}/role`, { role: "user" }).expect(200);
      await call(admin, "post", `/admin/users/${other.id}/ban`, { reason: "Thử" }).expect(200);
    });

    it("cấm thì bị đăng xuất ngay và không đăng nhập lại được; bỏ cấm thì vào lại được", async () => {
      await call(lan, "get", "/me").expect(200);

      const banned = await call(admin, "post", `/admin/users/${lan.id}/ban`, {
        reason: "Spam bình luận",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }).expect(200);
      expect(banned.body.data).toMatchObject({ banned: true, banReason: "Spam bình luận" });

      await call(lan, "get", "/me").expect(401);
      expect(await prisma.session.count({ where: { userId: lan.id } })).toBe(0);

      const signIn = () =>
        http()
          .post("/api/auth/sign-in/email")
          .set("Origin", "http://localhost:3000")
          .send({ email: "lan@test.local", password: "matkhau123" });
      expect((await signIn()).status).toBe(403);

      await call(admin, "post", `/admin/users/${lan.id}/unban`).expect(200);
      expect((await signIn()).status).toBe(200);
    });

    it("thiếu lý do cấm, hạn đã qua: 400; thành viên không có: 404", async () => {
      const noReason = await call(admin, "post", `/admin/users/${lan.id}/ban`, {}).expect(400);
      expect(noReason.body.error.fields.reason).toBe(ADMIN_MESSAGES.BAN_REASON_REQUIRED);

      const past = await call(admin, "post", `/admin/users/${lan.id}/ban`, {
        reason: "Spam",
        expiresAt: "2020-01-01T00:00:00.000Z",
      }).expect(400);
      expect(past.body.error.fields.expiresAt).toBe(ADMIN_MESSAGES.BAN_EXPIRES_PAST);

      await call(admin, "post", "/admin/users/khong-co/ban", { reason: "Spam" }).expect(404);
    });
  });
});
