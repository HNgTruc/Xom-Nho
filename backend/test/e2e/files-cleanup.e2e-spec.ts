import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { FilesService, ORPHAN_MAX_AGE_MS } from "../../src/modules/files/files.service.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);

/** File tải lên trong test nằm ở UPLOAD_DIR tạm (vitest.config.e2e.ts). */
const onDisk = (storageKey: string) => existsSync(join(process.env.UPLOAD_DIR ?? "", storageKey));

/**
 * Dọn file tải lên mà không gắn bài quá 1 ngày (`FilesService.cleanupOrphans`, docs/co-so-du-lieu.md):
 * chỉ file `purpose = POST` chưa gắn bài, không bao giờ đụng ảnh đại diện.
 */
describe("Dọn file không gắn bài", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let files: FilesService;
  let lan: { cookie: string; id: string };

  const http = () => request(app.getHttpServer());
  const upload = async () => {
    const res = await http()
      .post("/api/v1/files")
      .set("Cookie", lan.cookie)
      .attach("file", PNG, { filename: "anh.png", contentType: "image/png" })
      .expect(201);
    return res.body.data.id as string;
  };
  /** Lùi giờ tạo file về `hoursAgo` giờ trước. */
  const age = (id: string, hoursAgo: number) =>
    prisma.media.update({
      where: { id },
      data: { createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000) },
    });
  const row = (id: string) => prisma.media.findUnique({ where: { id } });

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
    files = app.get(FilesService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    lan = await signUp(app, prisma, "lan@test.local");
    await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it("file chưa gắn bài quá 1 ngày bị xóa cả dòng lẫn file trên đĩa", async () => {
    const id = await upload();
    await age(id, 25);
    const { storageKey } = (await row(id))!;
    expect(onDisk(storageKey)).toBe(true);

    expect(await files.cleanupOrphans()).toBe(1);

    expect(await row(id)).toBeNull();
    expect(onDisk(storageKey)).toBe(false);
  });

  it("file mới tải chưa tới 1 ngày thì giữ (người dùng có thể đang viết dở)", async () => {
    const id = await upload();
    await age(id, 23);

    expect(await files.cleanupOrphans()).toBe(0);
    expect(await row(id)).not.toBeNull();
  });

  it("file đã gắn bài thì giữ dù cũ", async () => {
    const id = await upload();
    await http()
      .post("/api/v1/posts")
      .set("Cookie", lan.cookie)
      .send({ category: "doi-song", mediaIds: [id] })
      .expect(201);
    await age(id, 24 * 30);
    const { storageKey } = (await row(id))!;

    expect(await files.cleanupOrphans()).toBe(0);
    expect(await row(id)).not.toBeNull();
    expect(onDisk(storageKey)).toBe(true);
  });

  it("ảnh đại diện (postId cũng null) thì giữ dù cũ", async () => {
    const res = await http()
      .put("/api/v1/me/avatar")
      .set("Cookie", lan.cookie)
      .attach("file", PNG, { filename: "mat.png", contentType: "image/png" })
      .expect(200);
    const avatarId = res.body.data.avatarId as string;
    await age(avatarId, 24 * 30);
    const { storageKey } = (await row(avatarId))!;

    expect(await files.cleanupOrphans()).toBe(0);
    expect(await row(avatarId)).not.toBeNull();
    expect(onDisk(storageKey)).toBe(true);
  });

  it("mốc 1 ngày tính theo thời điểm truyền vào", async () => {
    const id = await upload();

    expect(await files.cleanupOrphans(new Date(Date.now() + ORPHAN_MAX_AGE_MS - 60_000))).toBe(0);
    expect(await files.cleanupOrphans(new Date(Date.now() + ORPHAN_MAX_AGE_MS + 60_000))).toBe(1);
    expect(await row(id)).toBeNull();
  });
});
