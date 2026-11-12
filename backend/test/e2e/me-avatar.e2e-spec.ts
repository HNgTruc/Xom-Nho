import { existsSync } from "node:fs";
import { join } from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { FILE_MESSAGES, LIMITS } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
const WEBP = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 ")]);
const MP4 = Buffer.concat([
  Buffer.from([0, 0, 0, 0x20]),
  Buffer.from("ftypisom"),
  Buffer.alloc(64),
]);
const FAKE_JPG = Buffer.from("<script>alert(1)</script> day khong phai anh");
const BIG_FILE_TIMEOUT = 30_000;

/** File tải lên trong test nằm ở UPLOAD_DIR tạm (vitest.config.e2e.ts). */
const onDisk = (storageKey: string) => existsSync(join(process.env.UPLOAD_DIR ?? "", storageKey));

/** Ảnh đại diện (`PUT /me/avatar`, `PATCH /me`, docs/tinh-nang.md mục 1.4, ADR 0005). */
describe("Ảnh đại diện (/api/v1/me/avatar)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: { cookie: string; id: string };
  let minh: { cookie: string; id: string };

  const http = () => request(app.getHttpServer());

  const putAvatar = (
    cookie: string,
    data: Buffer,
    filename = "mat.png",
    contentType = "image/png",
  ) =>
    http()
      .put("/api/v1/me/avatar")
      .set("Cookie", cookie)
      .attach("file", data, { filename, contentType });

  const mediaOf = (id: string) => prisma.media.findUnique({ where: { id } });

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

  it("tải ảnh lên thì hồ sơ có avatarId, file nằm ở avatars/", async () => {
    const res = await putAvatar(lan.cookie, PNG).expect(200);

    const avatarId = res.body.data.avatarId as string;
    expect(avatarId).toEqual(expect.any(String));
    const media = await mediaOf(avatarId);
    expect(media).toMatchObject({
      ownerId: lan.id,
      purpose: "AVATAR",
      kind: "IMAGE",
      postId: null,
    });
    expect(media?.storageKey).toMatch(/^avatars\/[0-9a-f-]{36}\.png$/);
    expect(onDisk(media?.storageKey ?? "")).toBe(true);
  });

  it("hàng xóm khác xem được ảnh đại diện, thấy avatarId trên hồ sơ", async () => {
    const avatarId = (await putAvatar(lan.cookie, PNG).expect(200)).body.data.avatarId as string;

    await http().get(`/api/v1/files/${avatarId}`).set("Cookie", minh.cookie).expect(200);
    const profile = await http().get("/api/v1/users/lan").set("Cookie", minh.cookie).expect(200);
    expect(profile.body.data.avatarId).toBe(avatarId);
  });

  it("đổi ảnh thì ảnh cũ bị xóa khỏi database và ổ đĩa", async () => {
    const oldId = (await putAvatar(lan.cookie, PNG).expect(200)).body.data.avatarId as string;
    const oldKey = (await mediaOf(oldId))?.storageKey ?? "";

    const res = await putAvatar(lan.cookie, WEBP, "moi.webp", "image/webp").expect(200);

    expect(res.body.data.avatarId).not.toBe(oldId);
    expect(await mediaOf(oldId)).toBeNull();
    expect(onDisk(oldKey)).toBe(false);
    expect(await prisma.media.count()).toBe(1);
  });

  it("PATCH /me xóa ảnh thì bỏ avatarId, xóa file", async () => {
    const avatarId = (await putAvatar(lan.cookie, PNG).expect(200)).body.data.avatarId as string;
    const key = (await mediaOf(avatarId))?.storageKey ?? "";

    const res = await http()
      .patch("/api/v1/me")
      .set("Cookie", lan.cookie)
      .send({ image: "" })
      .expect(200);

    expect(res.body.data).toMatchObject({ avatarId: null, image: null });
    expect(await mediaOf(avatarId)).toBeNull();
    expect(onDisk(key)).toBe(false);
  });

  it("PATCH /me chỉ sửa tên thì giữ ảnh đại diện", async () => {
    const avatarId = (await putAvatar(lan.cookie, PNG).expect(200)).body.data.avatarId as string;

    const res = await http()
      .patch("/api/v1/me")
      .set("Cookie", lan.cookie)
      .send({ name: "Lan Anh" })
      .expect(200);

    expect(res.body.data.avatarId).toBe(avatarId);
  });

  it("video thì 400, không lưu gì, giữ ảnh cũ", async () => {
    const avatarId = (await putAvatar(lan.cookie, PNG).expect(200)).body.data.avatarId as string;

    const res = await putAvatar(lan.cookie, MP4, "clip.mp4", "video/mp4").expect(400);

    expect(res.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      message: FILE_MESSAGES.AVATAR_NOT_IMAGE,
    });
    expect(await prisma.media.count()).toBe(1);
    expect((await prisma.user.findUnique({ where: { id: lan.id } }))?.avatarId).toBe(avatarId);
  });

  it("file chữ đổi đuôi thành .jpg thì 400", async () => {
    const res = await putAvatar(lan.cookie, FAKE_JPG, "mat.jpg", "image/jpeg").expect(400);

    expect(res.body.error.message).toBe(FILE_MESSAGES.UNSUPPORTED);
    expect(await prisma.media.count()).toBe(0);
  });

  it(
    "ảnh lớn hơn 5 MB thì 400 báo cỡ ảnh",
    async () => {
      const big = Buffer.concat([PNG, Buffer.alloc(LIMITS.IMAGE_MAX_BYTES)]);

      const res = await putAvatar(lan.cookie, big).expect(400);

      expect(res.body.error.message).toBe(FILE_MESSAGES.IMAGE_TOO_LARGE);
    },
    BIG_FILE_TIMEOUT,
  );

  it("không gửi file thì 400", async () => {
    const res = await http().put("/api/v1/me/avatar").set("Cookie", lan.cookie).expect(400);

    expect(res.body.error.fields).toHaveProperty("file");
  });

  it("chưa đăng nhập thì 401", async () => {
    await http()
      .put("/api/v1/me/avatar")
      .attach("file", PNG, { filename: "mat.png", contentType: "image/png" })
      .expect(401);
  });
});
