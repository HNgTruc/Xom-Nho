import type { NestExpressApplication } from "@nestjs/platform-express";
import { DISLIKE_MESSAGES } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

type Account = { cookie: string; id: string };

/** Không thích bài (`/posts/:id/dislike`, ADR 0009): số công khai, loại trừ với Thích. */
describe("Không thích bài (/api/v1/posts/:id/dislike)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: Account;
  let minh: Account;
  let postId: string;

  const http = () => request(app.getHttpServer());
  const react = (method: "put" | "delete", kind: "like" | "dislike", who: Account, post = postId) =>
    http()[method](`/api/v1/posts/${post}/${kind}`).set("Cookie", who.cookie);

  async function createPost(status: "PUBLISHED" | "ARCHIVED", slug: string) {
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
        authorId: lan.id,
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
    await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
    postId = await createPost("PUBLISHED", "cho-phien");
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it("bấm 3 lần vẫn chỉ tính 1, bỏ thì về 0", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await react("put", "dislike", minh).expect(200);
      expect(res.body.data).toEqual({
        liked: false,
        likeCount: 0,
        disliked: true,
        dislikeCount: 1,
      });
    }

    const res = await react("delete", "dislike", minh).expect(200);

    expect(res.body.data).toMatchObject({ disliked: false, dislikeCount: 0 });
    expect(await prisma.postDislike.count()).toBe(0);
  });

  it("Thích và Không thích loại trừ nhau: bấm cái này thì cái kia tự gỡ", async () => {
    await react("put", "like", minh).expect(200);

    const disliked = await react("put", "dislike", minh).expect(200);
    expect(disliked.body.data).toEqual({
      liked: false,
      likeCount: 0,
      disliked: true,
      dislikeCount: 1,
    });

    const liked = await react("put", "like", minh).expect(200);
    expect(liked.body.data).toEqual({
      liked: true,
      likeCount: 1,
      disliked: false,
      dislikeCount: 0,
    });

    expect(await prisma.postLike.count()).toBe(1);
    expect(await prisma.postDislike.count()).toBe(0);
  });

  // 5 vòng × 6 yêu cầu: dưới giới hạn 60 lần / phút; các yêu cầu xếp hàng qua khóa dòng bài nên cần hơn 5 giây
  it(
    "bấm Thích, Không thích, bỏ cùng lúc thì không lỗi, không bao giờ còn cả hai",
    { timeout: 20_000 },
    async () => {
      for (let round = 0; round < 5; round++) {
        await Promise.all([
          react("put", "like", minh).expect(200),
          react("put", "dislike", minh).expect(200),
          react("delete", "like", minh).expect(200),
          react("put", "like", minh).expect(200),
          react("delete", "dislike", minh).expect(200),
          react("put", "dislike", minh).expect(200),
        ]);
        const [likes, dislikes] = await Promise.all([
          prisma.postLike.count({ where: { postId, userId: minh.id } }),
          prisma.postDislike.count({ where: { postId, userId: minh.id } }),
        ]);
        expect(likes + dislikes).toBeLessThanOrEqual(1);
      }
    },
  );

  it("gửi cùng lúc nhiều yêu cầu vẫn không sai số", async () => {
    await Promise.all(Array.from({ length: 5 }, () => react("put", "dislike", minh).expect(200)));

    expect(await prisma.postDislike.count({ where: { postId } })).toBe(1);
  });

  it("feed và trang bài có số không thích công khai, dislikedByMe theo người xem", async () => {
    await react("put", "dislike", minh).expect(200);

    const [mine, other] = await Promise.all([
      http().get("/api/v1/posts").set("Cookie", minh.cookie).expect(200),
      http().get("/api/v1/posts").set("Cookie", lan.cookie).expect(200),
    ]);
    expect(mine.body.data[0]).toMatchObject({
      dislikeCount: 1,
      dislikedByMe: true,
      likedByMe: false,
    });
    expect(other.body.data[0]).toMatchObject({ dislikeCount: 1, dislikedByMe: false });

    const detail = await http()
      .get("/api/v1/posts/cho-phien")
      .set("Cookie", lan.cookie)
      .expect(200);
    expect(detail.body.data).toMatchObject({ dislikeCount: 1, dislikedByMe: false });
  });

  it("bài đã ẩn: chủ bài nhận 403 kèm lời nhắn, người khác 404", async () => {
    const hidden = await createPost("ARCHIVED", "bai-an");

    const res = await react("put", "dislike", lan, hidden).expect(403);
    expect(res.body.error).toMatchObject({
      code: "FORBIDDEN",
      message: DISLIKE_MESSAGES.POST_CLOSED,
    });
    await react("put", "dislike", minh, hidden).expect(404);
  });

  it("bài không có: 404; chưa đăng nhập: 401", async () => {
    await react("put", "dislike", minh, "khong-co").expect(404);
    await react("delete", "dislike", minh, "khong-co").expect(404);
    await http().put(`/api/v1/posts/${postId}/dislike`).expect(401);
  });

  it("xóa bài thì lượt không thích đi theo", async () => {
    await react("put", "dislike", minh).expect(200);

    await http().delete(`/api/v1/posts/${postId}`).set("Cookie", lan.cookie).expect(204);

    expect(await prisma.postDislike.count()).toBe(0);
  });
});
