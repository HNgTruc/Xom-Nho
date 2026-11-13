import type { NestExpressApplication } from "@nestjs/platform-express";
import { LIKE_MESSAGES } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };

/** Thích bài và dữ liệu thẻ bài (`/posts/:id/like`, `GET /posts`, docs/tinh-nang.md mục 2.1, 2.6). */
describe("Thích bài (/api/v1/posts/:id/like) và thẻ bài trong danh sách", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let minh: Account;
  let admin: Account;
  let postId: string;

  const http = () => request(app.getHttpServer());
  const like = (who: Account, post = postId) =>
    http().put(`/api/v1/posts/${post}/like`).set("Cookie", who.cookie);
  const unlike = (who: Account, post = postId) =>
    http().delete(`/api/v1/posts/${post}/like`).set("Cookie", who.cookie);
  const feed = (who: Account) => http().get("/api/v1/posts").set("Cookie", who.cookie);

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

  /** Bình luận tạo thẳng trong DB, cách nhau 1 phút để thứ tự rõ ràng. */
  async function addComment(
    post: string,
    authorId: string,
    content: string,
    minute: number,
    extra: { parentId?: string; status?: "VISIBLE" | "HIDDEN" } = {},
  ) {
    const created = await prisma.comment.create({
      data: {
        postId: post,
        authorId,
        content,
        createdAt: new Date(Date.UTC(2026, 10, 13, 8, minute)),
        ...extra,
      },
    });
    return created.id;
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

  describe("PUT, DELETE /posts/:id/like", () => {
    it("thích 3 lần liền vẫn chỉ tính 1, bỏ thích thì về 0", async () => {
      for (let i = 0; i < 3; i++) {
        const res = await like(minh).expect(200);
        expect(res.body.data).toEqual({ liked: true, likeCount: 1 });
      }

      const res = await unlike(minh).expect(200);

      expect(res.body.data).toEqual({ liked: false, likeCount: 0 });
      expect(await prisma.postLike.count()).toBe(0);
    });

    it("gửi cùng lúc nhiều yêu cầu thích vẫn không sai số", async () => {
      await Promise.all(Array.from({ length: 5 }, () => like(minh).expect(200)));

      expect(await prisma.postLike.count({ where: { postId } })).toBe(1);
    });

    it("số thích đếm mọi người, liked theo người đang gọi", async () => {
      await like(minh).expect(200);
      await like(lan).expect(200);

      const res = await unlike(admin).expect(200);

      expect(res.body.data).toEqual({ liked: false, likeCount: 2 });
    });

    it("bài đã ẩn: chủ bài nhận 403 kèm lời nhắn, người khác 404", async () => {
      const hidden = await createPost(lan.id, "ARCHIVED", "bai-an");

      const res = await like(lan, hidden).expect(403);
      expect(res.body.error).toMatchObject({
        code: "FORBIDDEN",
        message: LIKE_MESSAGES.POST_CLOSED,
      });
      await like(minh, hidden).expect(404);
    });

    it("bài không có thì 404", async () => {
      await like(minh, "khong-co").expect(404);
      await unlike(minh, "khong-co").expect(404);
    });

    it("chưa đăng nhập thì 401", async () => {
      await http().put(`/api/v1/posts/${postId}/like`).expect(401);
    });

    it("xóa bài thì lượt thích đi theo", async () => {
      await like(minh).expect(200);

      await http().delete(`/api/v1/posts/${postId}`).set("Cookie", lan.cookie).expect(204);

      expect(await prisma.postLike.count()).toBe(0);
    });
  });

  describe("GET /posts: số thích, likedByMe, 2 bình luận mới nhất", () => {
    it("mỗi thẻ bài có số thích và người xem đã thích chưa", async () => {
      await like(minh).expect(200);
      await like(admin).expect(200);

      const [mine, other] = await Promise.all([feed(minh).expect(200), feed(lan).expect(200)]);

      expect(mine.body.data[0]).toMatchObject({ likeCount: 2, likedByMe: true });
      expect(other.body.data[0]).toMatchObject({ likeCount: 2, likedByMe: false });
    });

    it("chỉ 2 bình luận gốc đang hiện mới nhất, không lẫn trả lời, bình luận ẩn hay bài khác", async () => {
      const other = await createPost(minh.id, "PUBLISHED", "bai-khac");
      const oldest = await addComment(postId, minh.id, "Cũ nhất", 1);
      await addComment(postId, admin.id, "Thứ hai", 2);
      await addComment(postId, minh.id, "Mới nhất", 3);
      await addComment(postId, lan.id, "Trả lời mới", 4, { parentId: oldest });
      await addComment(postId, minh.id, "Đã ẩn", 5, { status: "HIDDEN" });
      await addComment(other, lan.id, "Bên bài khác", 6);

      // Trưởng xóm cũng không thấy bình luận ẩn trên thẻ bài
      const res = await feed(admin).expect(200);
      const card = res.body.data.find((p: { id: string }) => p.id === postId);

      expect(card.latestComments).toEqual([
        {
          id: expect.any(String),
          content: "Mới nhất",
          author: { id: minh.id, name: "minh", username: "minh", image: null, avatarId: null },
          createdAt: "2026-11-13T08:03:00.000Z",
        },
        expect.objectContaining({ content: "Thứ hai" }),
      ]);
      expect(card.commentCount).toBe(4);
    });

    it("bài chưa có bình luận thì latestComments rỗng", async () => {
      const res = await feed(minh).expect(200);

      expect(res.body.data[0]).toMatchObject({
        likeCount: 0,
        likedByMe: false,
        latestComments: [],
      });
    });
  });

  it("GET /posts/:slug có số thích, likedByMe, không có latestComments", async () => {
    await like(minh).expect(200);

    const res = await http().get("/api/v1/posts/cho-phien").set("Cookie", minh.cookie).expect(200);

    expect(res.body.data).toMatchObject({ likeCount: 1, likedByMe: true });
    expect(res.body.data).not.toHaveProperty("latestComments");
  });
});
