import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { FILE_MESSAGES } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
const MP4 = Buffer.concat([
  Buffer.from([0, 0, 0, 0x20]),
  Buffer.from("ftypisom"),
  Buffer.alloc(64),
]);
const FAKE_JPG = Buffer.from("<script>alert(1)</script> day khong phai anh");

/** File tải lên trong test nằm ở UPLOAD_DIR tạm (vitest.config.e2e.ts). */
const onDisk = (storageKey: string) => existsSync(join(process.env.UPLOAD_DIR ?? "", storageKey));

/** Ảnh bìa (`PUT`, `DELETE /me/cover`) và nơi ở (`PATCH /me`), docs/tinh-nang.md mục 1.3, 1.4. */
describe("Ảnh bìa, nơi ở (/api/v1/me/cover, PATCH /api/v1/me)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: { cookie: string; id: string };
  let minh: { cookie: string; id: string };

  const http = () => request(app.getHttpServer());
  const putCover = (
    cookie: string,
    data: Buffer,
    filename = "bia.png",
    contentType = "image/png",
  ) =>
    http()
      .put("/api/v1/me/cover")
      .set("Cookie", cookie)
      .attach("file", data, { filename, contentType });
  const keyOf = async (id: string) =>
    (await prisma.media.findUniqueOrThrow({ where: { id } })).storageKey;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    lan = await signUp(app, prisma, "lan@test.local");
    minh = await signUp(app, prisma, "minh@test.local");
    await prisma.user.update({ where: { id: lan.id }, data: { username: "lan" } });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  it("tải ảnh bìa lên thì hồ sơ có coverId, file ở covers/, không đụng ảnh đại diện", async () => {
    const res = await putCover(lan.cookie, PNG).expect(200);

    const coverId = res.body.data.coverId as string;
    expect(res.body.data.avatarId).toBeNull();
    const media = await prisma.media.findUniqueOrThrow({ where: { id: coverId } });
    expect(media).toMatchObject({ ownerId: lan.id, purpose: "COVER", kind: "IMAGE", postId: null });
    expect(media.storageKey).toMatch(/^covers\/[0-9a-f-]{36}\.png$/);
    expect(onDisk(media.storageKey)).toBe(true);
  });

  it("hàng xóm khác thấy coverId trên hồ sơ và xem được ảnh", async () => {
    const coverId = (await putCover(lan.cookie, PNG).expect(200)).body.data.coverId as string;

    const view = await http().get("/api/v1/users/lan").set("Cookie", minh.cookie).expect(200);
    expect(view.body.data.coverId).toBe(coverId);
    await http().get(`/api/v1/files/${coverId}`).set("Cookie", minh.cookie).expect(200);
  });

  it("đổi ảnh bìa thì xóa ảnh cũ khỏi ổ đĩa", async () => {
    const oldId = (await putCover(lan.cookie, PNG).expect(200)).body.data.coverId as string;
    const oldKey = await keyOf(oldId);

    const newId = (await putCover(lan.cookie, PNG).expect(200)).body.data.coverId as string;

    expect(newId).not.toBe(oldId);
    expect(await prisma.media.findUnique({ where: { id: oldId } })).toBeNull();
    expect(onDisk(oldKey)).toBe(false);
  });

  it("bỏ ảnh bìa thì coverId về null, xóa file; bỏ lần nữa không lỗi", async () => {
    const coverId = (await putCover(lan.cookie, PNG).expect(200)).body.data.coverId as string;
    const key = await keyOf(coverId);

    const res = await http().delete("/api/v1/me/cover").set("Cookie", lan.cookie).expect(200);

    expect(res.body.data.coverId).toBeNull();
    expect(onDisk(key)).toBe(false);
    await http().delete("/api/v1/me/cover").set("Cookie", lan.cookie).expect(200);
  });

  it("video làm ảnh bìa: 400 với câu tiếng Việt", async () => {
    const res = await putCover(lan.cookie, MP4, "bia.mp4", "video/mp4").expect(400);

    expect(res.body.error.fields.file).toBe(FILE_MESSAGES.COVER_NOT_IMAGE);
    expect(await prisma.media.count()).toBe(0);
  });

  it("file đổi đuôi thành .jpg mà không phải ảnh: 400", async () => {
    const res = await putCover(lan.cookie, FAKE_JPG, "bia.jpg", "image/jpeg").expect(400);

    expect(res.body.error.fields.file).toBe(FILE_MESSAGES.UNSUPPORTED);
  });

  it("ảnh bìa không bị dọn như file bài viết bỏ dở", async () => {
    const coverId = (await putCover(lan.cookie, PNG).expect(200)).body.data.coverId as string;
    await prisma.media.update({
      where: { id: coverId },
      data: { createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    });

    const { FilesService } = await import("../../src/modules/files/files.service.js");
    await app.get(FilesService).cleanupOrphans();

    expect(await prisma.media.findUnique({ where: { id: coverId } })).not.toBeNull();
  });

  it("sửa nơi ở thì hồ sơ hiện nơi ở; gửi rỗng thì xóa", async () => {
    const saved = await http()
      .patch("/api/v1/me")
      .set("Cookie", lan.cookie)
      .send({ location: "  Quận 3, TP.HCM " })
      .expect(200);
    expect(saved.body.data.location).toBe("Quận 3, TP.HCM");
    const view = await http().get("/api/v1/users/lan").set("Cookie", minh.cookie).expect(200);
    expect(view.body.data.location).toBe("Quận 3, TP.HCM");

    const cleared = await http()
      .patch("/api/v1/me")
      .set("Cookie", lan.cookie)
      .send({ location: "" })
      .expect(200);
    expect(cleared.body.data.location).toBeNull();
  });

  it("nơi ở quá 100 ký tự: 400", async () => {
    const res = await http()
      .patch("/api/v1/me")
      .set("Cookie", lan.cookie)
      .send({ location: "x".repeat(101) })
      .expect(400);

    expect(res.body.error.fields.location).toBe("Nơi ở tối đa 100 ký tự");
  });
});
