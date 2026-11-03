import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";
import { createTestApp } from "../fixtures/app.js";
import { createTestPrisma, resetDatabase } from "../fixtures/database.js";

const WEB_ORIGIN = "http://localhost:3000";
const account = { name: "Trần Thị Đào", email: "dao@xomnho.test", password: "matkhau123" };

describe("Đăng nhập (Better Auth + /me)", () => {
  let app: NestExpressApplication;
  let prisma: PrismaClient;

  const http = () => request(app.getHttpServer());

  /** Đăng ký qua Better Auth, trả cookie phiên. */
  async function signUp(input = account): Promise<string> {
    const res = await http()
      .post("/api/auth/sign-up/email")
      .set("Origin", WEB_ORIGIN)
      .send(input)
      .expect(200);
    return cookieOf(res.headers["set-cookie"]);
  }

  function cookieOf(setCookie: string | string[] | undefined): string {
    const list = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    return list.map((c) => c.split(";")[0]).join("; ");
  }

  beforeAll(async () => {
    app = await createTestApp();
    prisma = createTestPrisma();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it("đăng ký xong có cookie phiên, /me trả đúng người, vai trò user, username tự sinh", async () => {
    const cookie = await signUp();

    const res = await http().get("/api/v1/me").set("Cookie", cookie).expect(200);

    expect(res.body.data).toMatchObject({
      name: "Trần Thị Đào",
      email: "dao@xomnho.test",
      role: "user",
      username: "tranthidao",
      bio: null,
    });
  });

  it("hai người trùng tên thì username thêm số", async () => {
    await signUp();
    const cookie = await signUp({ ...account, email: "dao2@xomnho.test" });

    const res = await http().get("/api/v1/me").set("Cookie", cookie).expect(200);

    expect(res.body.data.username).toBe("tranthidao2");
  });

  it("đăng ký không tự đặt được vai trò admin", async () => {
    await http()
      .post("/api/auth/sign-up/email")
      .set("Origin", WEB_ORIGIN)
      .send({ ...account, role: "admin" })
      .expect((res) => expect(res.status).toBeGreaterThanOrEqual(200));

    const user = await prisma.user.findUnique({ where: { email: account.email } });
    expect(user?.role ?? "user").toBe("user");
  });

  it("chưa đăng nhập gọi /me thì 401 đúng định dạng lỗi", async () => {
    const res = await http().get("/api/v1/me").expect(401);

    expect(res.body).toEqual({ error: { code: "UNAUTHORIZED", message: expect.any(String) } });
  });

  it("email trùng thì Better Auth báo mã USER_ALREADY_EXISTS...", async () => {
    await signUp();

    const res = await http()
      .post("/api/auth/sign-up/email")
      .set("Origin", WEB_ORIGIN)
      .send(account);

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.code).toMatch(/^USER_ALREADY_EXISTS/);
  });

  it("đăng nhập đúng mật khẩu có phiên; sai mật khẩu nhận INVALID_EMAIL_OR_PASSWORD", async () => {
    await signUp();

    const ok = await http()
      .post("/api/auth/sign-in/email")
      .set("Origin", WEB_ORIGIN)
      .send({ email: account.email, password: account.password })
      .expect(200);
    await http().get("/api/v1/me").set("Cookie", cookieOf(ok.headers["set-cookie"])).expect(200);

    const wrong = await http()
      .post("/api/auth/sign-in/email")
      .set("Origin", WEB_ORIGIN)
      .send({ email: account.email, password: "sai-mat-khau" })
      .expect(401);
    expect(wrong.body.code).toBe("INVALID_EMAIL_OR_PASSWORD");
  });

  it("PATCH /me sửa giới thiệu; ảnh không phải http(s) bị từ chối kèm lỗi theo trường", async () => {
    const cookie = await signUp();

    const ok = await http()
      .patch("/api/v1/me")
      .set("Cookie", cookie)
      .send({ bio: "Thích nấu ăn" })
      .expect(200);
    expect(ok.body.data.bio).toBe("Thích nấu ăn");

    const bad = await http()
      .patch("/api/v1/me")
      .set("Cookie", cookie)
      .send({ image: "javascript:alert(1)" })
      .expect(400);
    expect(bad.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      fields: { image: expect.any(String) },
    });
  });

  it("PATCH /me không đổi được vai trò", async () => {
    const cookie = await signUp();

    await http()
      .patch("/api/v1/me")
      .set("Cookie", cookie)
      .send({ name: "Đào", role: "admin" })
      .expect(200);

    const user = await prisma.user.findUnique({ where: { email: account.email } });
    expect(user).toMatchObject({ name: "Đào", role: "user" });
  });

  it("bị cấm: phiên cũ nhận 403 kèm lý do, đăng nhập lại bị từ chối", async () => {
    const cookie = await signUp();
    await prisma.user.update({
      where: { email: account.email },
      data: { banned: true, banReason: "spam" },
    });

    const me = await http().get("/api/v1/me").set("Cookie", cookie).expect(403);
    expect(me.body.error).toEqual({
      code: "FORBIDDEN",
      message: "Tài khoản của bạn đã bị khóa. Lý do: spam",
    });

    const signIn = await http()
      .post("/api/auth/sign-in/email")
      .set("Origin", WEB_ORIGIN)
      .send({ email: account.email, password: account.password });
    expect(signIn.status).toBe(403);
    expect(signIn.body).toMatchObject({
      code: "BANNED_USER",
      message: "Tài khoản của bạn đã bị khóa. Lý do: spam",
    });
  });

  it("đăng ký từ origin lạ bị Better Auth chặn", async () => {
    const res = await http()
      .post("/api/auth/sign-up/email")
      .set("Origin", "https://trang-la.example")
      .send(account);

    expect(res.status).toBe(403);
  });

  it("request có cookie phiên nhưng đến từ origin lạ (CSRF) bị chặn", async () => {
    const cookie = await signUp();

    const res = await http()
      .post("/api/auth/sign-out")
      .set("Origin", "https://trang-la.example")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("INVALID_ORIGIN");
  });

  it("app Expo (scheme xomnho://) là origin được tin", async () => {
    const cookie = await signUp();

    await http()
      .post("/api/auth/sign-out")
      .set("Origin", "xomnho://")
      .set("Cookie", cookie)
      .send({})
      .expect(200);
  });

  it("GET /auth/providers công khai; chưa có khóa OAuth thì tắt Google, GitHub", async () => {
    const res = await http().get("/api/v1/auth/providers").expect(200);

    expect(res.body.data).toEqual({ email: true, google: false, github: false });
  });
});
