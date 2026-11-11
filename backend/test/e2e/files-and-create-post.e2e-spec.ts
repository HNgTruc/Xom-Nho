import type { NestExpressApplication } from "@nestjs/platform-express";
import { FILE_MESSAGES, LIMITS } from "@xom-nho/api";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";
import { signUp } from "../fixtures/session.js";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
const MP4 = Buffer.concat([
  Buffer.from([0, 0, 0, 0x20]),
  Buffer.from("ftypisom"),
  Buffer.alloc(2048, 7),
]);
/** File vài MB: tải lên chậm khi cả bộ e2e chạy cùng lúc, cho thêm thời gian. */
const BIG_FILE_TIMEOUT = 30_000;
/** File có nội dung là chữ, đặt tên đuôi .jpg và Content-Type ảnh: phải bị từ chối. */
const FAKE_JPG = Buffer.from("<script>alert(1)</script> day khong phai anh");

/**
 * Tải ảnh, video (`POST /files`, `GET /files/:id`, ADR 0005) và đăng bài kèm file (`POST /posts`, ADR 0008).
 */
describe("Tải file và đăng bài (/api/v1/files, /api/v1/posts)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;
  let lan: { cookie: string; id: string };
  let minh: { cookie: string; id: string };

  const http = () => request(app.getHttpServer());

  const upload = (cookie: string, data: Buffer, filename = "anh.png", contentType = "image/png") =>
    http()
      .post("/api/v1/files")
      .set("Cookie", cookie)
      .attach("file", data, { filename, contentType });

  const createPost = (cookie: string, body: Record<string, unknown>) =>
    http()
      .post("/api/v1/posts")
      .set("Cookie", cookie)
      .send({ category: "doi-song", ...body });

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    lan = await signUp(app, prisma, "lan@test.local");
    minh = await signUp(app, prisma, "minh@test.local");
    await prisma.category.create({ data: { name: "Đời sống", slug: "doi-song" } });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
    await app.close();
  });

  describe("POST /files", () => {
    it("nhận ảnh PNG, trả id, loại, kiểu theo chữ ký nhị phân", async () => {
      const res = await upload(lan.cookie, PNG).expect(201);

      expect(res.body.data).toEqual({
        id: expect.any(String),
        kind: "IMAGE",
        mimeType: "image/png",
      });
      const row = await prisma.media.findUniqueOrThrow({ where: { id: res.body.data.id } });
      expect(row).toMatchObject({ ownerId: lan.id, postId: null, sizeBytes: PNG.length });
      expect(row.storageKey).toMatch(/^images\/[0-9a-f-]{36}\.png$/);
    });

    it("nhận video MP4 dù trình duyệt gửi sai Content-Type", async () => {
      const res = await upload(lan.cookie, MP4, "clip.bin", "application/octet-stream").expect(201);

      expect(res.body.data).toMatchObject({ kind: "VIDEO", mimeType: "video/mp4" });
      const row = await prisma.media.findUniqueOrThrow({ where: { id: res.body.data.id } });
      expect(row.storageKey).toMatch(/^videos\/[0-9a-f-]{36}\.mp4$/);
    });

    it("file chữ đổi đuôi thành .jpg thì 400, không lưu gì", async () => {
      const res = await upload(lan.cookie, FAKE_JPG, "anh.jpg", "image/jpeg").expect(400);

      expect(res.body.error).toMatchObject({
        code: "VALIDATION_ERROR",
        message: FILE_MESSAGES.UNSUPPORTED,
      });
      expect(await prisma.media.count()).toBe(0);
    });

    it(
      "ảnh lớn hơn 5 MB thì 400 báo cỡ ảnh",
      async () => {
        const big = Buffer.concat([PNG, Buffer.alloc(LIMITS.IMAGE_MAX_BYTES)]);

        const res = await upload(lan.cookie, big).expect(400);

        expect(res.body.error.message).toBe(FILE_MESSAGES.IMAGE_TOO_LARGE);
      },
      BIG_FILE_TIMEOUT,
    );

    it(
      "file lớn hơn 25 MB thì 413, multer dừng đọc",
      async () => {
        const huge = Buffer.concat([MP4, Buffer.alloc(LIMITS.VIDEO_MAX_BYTES)]);

        const res = await upload(lan.cookie, huge, "clip.mp4", "video/mp4").expect(413);

        expect(res.body.error).toMatchObject({
          code: "VALIDATION_ERROR",
          message: FILE_MESSAGES.TOO_LARGE,
        });
      },
      BIG_FILE_TIMEOUT,
    );

    it("không gửi file thì 400", async () => {
      const res = await http().post("/api/v1/files").set("Cookie", lan.cookie).expect(400);

      expect(res.body.error.fields).toHaveProperty("file");
    });

    it("khách tải lên thì 401", async () => {
      await http()
        .post("/api/v1/files")
        .attach("file", PNG, { filename: "a.png", contentType: "image/png" })
        .expect(401);
    });
  });

  describe("GET /files/:id", () => {
    it("người tải lên xem được file chưa đăng, đúng nội dung, cache riêng", async () => {
      const { body } = await upload(lan.cookie, PNG).expect(201);

      const res = await http()
        .get(`/api/v1/files/${body.data.id}`)
        .set("Cookie", lan.cookie)
        .buffer(true)
        .parse((response, done) => {
          const chunks: Buffer[] = [];
          response.on("data", (chunk: Buffer) => chunks.push(chunk));
          response.on("end", () => done(null, Buffer.concat(chunks)));
        })
        .expect(200);

      expect(res.headers["content-type"]).toBe("image/png");
      expect(res.headers["cache-control"]).toContain("private");
      expect(res.headers["x-content-type-options"]).toBe("nosniff");
      expect(Buffer.compare(res.body as Buffer, PNG)).toBe(0);
    });

    it("hàng xóm khác xem file chưa gắn bài thì 404", async () => {
      const { body } = await upload(lan.cookie, PNG).expect(201);

      await http().get(`/api/v1/files/${body.data.id}`).set("Cookie", minh.cookie).expect(404);
    });

    it("video hỗ trợ Range để tua", async () => {
      const { body } = await upload(lan.cookie, MP4, "clip.mp4", "video/mp4").expect(201);

      const res = await http()
        .get(`/api/v1/files/${body.data.id}`)
        .set("Cookie", lan.cookie)
        .set("Range", "bytes=0-99")
        .expect(206);

      expect(res.headers["content-range"]).toBe(`bytes 0-99/${MP4.length}`);
    });

    it("khách xem file thì 401", async () => {
      const { body } = await upload(lan.cookie, PNG).expect(201);

      await http().get(`/api/v1/files/${body.data.id}`).expect(401);
    });

    it.each(["khong-co", "../../etc/passwd", "x".repeat(65)])("id %s thì 404", async (id) => {
      await http()
        .get(`/api/v1/files/${encodeURIComponent(id)}`)
        .set("Cookie", lan.cookie)
        .expect(404);
    });
  });

  describe("POST /posts", () => {
    it("hàng xóm đăng thẳng bài kèm ảnh, video theo thứ tự; ai trong xóm cũng xem được file", async () => {
      const image = (await upload(lan.cookie, PNG).expect(201)).body.data;
      const video = (await upload(lan.cookie, MP4, "clip.mp4", "video/mp4").expect(201)).body.data;

      const res = await createPost(lan.cookie, {
        content: "Chợ phiên đầu ngõ\nAi rảnh ghé nhé",
        mediaIds: [video.id, image.id],
      }).expect(201);

      expect(res.body.data).toMatchObject({
        title: "",
        slug: "cho-phien-dau-ngo-ai-ranh-ghe-nhe",
        content: "Chợ phiên đầu ngõ\nAi rảnh ghé nhé",
        contentFormat: "PLAIN",
        status: "PUBLISHED",
        publishedAt: expect.any(String),
        media: [
          { id: video.id, kind: "VIDEO", mimeType: "video/mp4" },
          { id: image.id, kind: "IMAGE", mimeType: "image/png" },
        ],
      });

      const feed = await http().get("/api/v1/posts").set("Cookie", minh.cookie).expect(200);
      expect(feed.body.data[0].media).toHaveLength(2);
      await http().get(`/api/v1/files/${image.id}`).set("Cookie", minh.cookie).expect(200);
    });

    it("chỉ có ảnh, không có chữ vẫn đăng được", async () => {
      const image = (await upload(lan.cookie, PNG).expect(201)).body.data;

      const res = await createPost(lan.cookie, { mediaIds: [image.id] }).expect(201);

      expect(res.body.data).toMatchObject({ slug: "bai-viet", excerpt: "" });
    });

    it("hai bài cùng tiêu đề thì slug thứ hai có hậu tố -2", async () => {
      await createPost(lan.cookie, { title: "Bàn tròn", content: "Một" }).expect(201);
      const res = await createPost(minh.cookie, { title: "Bàn tròn", content: "Hai" }).expect(201);

      expect(res.body.data.slug).toBe("ban-tron-2");
    });

    it("dùng ảnh của người khác thì 400 và không tạo bài", async () => {
      const image = (await upload(lan.cookie, PNG).expect(201)).body.data;

      const res = await createPost(minh.cookie, {
        content: "Lấy ảnh",
        mediaIds: [image.id],
      }).expect(400);

      expect(res.body.error.fields).toHaveProperty("mediaIds");
      expect(await prisma.post.count()).toBe(0);
      expect((await prisma.media.findUniqueOrThrow({ where: { id: image.id } })).postId).toBeNull();
    });

    it("ảnh đã gắn bài khác thì 400, bài trước giữ nguyên ảnh", async () => {
      const image = (await upload(lan.cookie, PNG).expect(201)).body.data;
      await createPost(lan.cookie, { content: "Bài một", mediaIds: [image.id] }).expect(201);

      await createPost(lan.cookie, { content: "Bài hai", mediaIds: [image.id] }).expect(400);

      expect(await prisma.post.count()).toBe(1);
    });

    it.each([
      [{ content: "   " }, "content"],
      [{ content: "Chào", category: "" }, "category"],
      [{ content: "Chào", category: "khong-co" }, "category"],
      [{ content: "Chào", mediaIds: Array.from({ length: 11 }, (_, i) => `m${i}`) }, "mediaIds"],
    ])("dữ liệu sai %j thì 400 ở trường %s", async (body, field) => {
      const res = await createPost(lan.cookie, body).expect(400);

      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(res.body.error.fields).toHaveProperty(field);
    });

    it("khách đăng bài thì 401", async () => {
      await http()
        .post("/api/v1/posts")
        .send({ content: "Chào", category: "doi-song" })
        .expect(401);
    });

    it("người bị cấm đăng bài thì 403", async () => {
      await prisma.user.update({ where: { id: lan.id }, data: { banned: true } });

      await createPost(lan.cookie, { content: "Chào" }).expect(403);
    });
  });
});
