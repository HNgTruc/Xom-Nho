import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types.js";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

describe("GET /api/v1/categories", () => {
  let app: INestApplication<App>;
  let prisma: PrismaClient;
  let memberCookie: string;

  const get = () =>
    request(app.getHttpServer()).get("/api/v1/categories").set("Cookie", memberCookie);

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    memberCookie = (await signUp(app, prisma, "hangxom@test.local")).cookie;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it("hàng xóm gọi được, trả mảng rỗng khi chưa có danh mục", async () => {
    const res = await get().expect(200);

    expect(res.body).toEqual({ data: [] });
  });

  it("sắp theo sortOrder và chỉ đếm bài đã đăng", async () => {
    await prisma.user.create({ data: { id: "u1", name: "Lan", email: "lan@test.local" } });
    const hoiDap = await prisma.category.create({
      data: { name: "Hỏi đáp", slug: "hoi-dap", sortOrder: 1 },
    });
    await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song", sortOrder: 0 } });

    const base = {
      excerpt: "",
      content: "",
      searchText: "",
      authorId: "u1",
      categoryId: hoiDap.id,
    };
    await prisma.post.createMany({
      data: [
        { ...base, title: "Đã đăng 1", slug: "a", status: "PUBLISHED" },
        { ...base, title: "Đã đăng 2", slug: "b", status: "PUBLISHED" },
        { ...base, title: "Chờ duyệt", slug: "c", status: "PENDING" },
        { ...base, title: "Bản nháp", slug: "d", status: "DRAFT" },
      ],
    });

    const res = await get().expect(200);

    expect(res.body.data).toEqual([
      {
        id: expect.any(String),
        name: "Đời sống",
        slug: "doi-song",
        description: null,
        color: "amber",
        icon: null,
        postCount: 0,
      },
      {
        id: hoiDap.id,
        name: "Hỏi đáp",
        slug: "hoi-dap",
        description: null,
        color: "amber",
        icon: null,
        postCount: 2,
      },
    ]);
  });
});
