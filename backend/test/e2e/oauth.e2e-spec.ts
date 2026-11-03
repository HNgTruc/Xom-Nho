import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { createTestApp } from "../fixtures/app.js";

/**
 * Đăng nhập Google/GitHub với khóa giả: Better Auth tự dựng link sang nhà cung cấp, không gọi mạng.
 * Kiểm tra cấu hình (bật nút, link quay về) và chặn callbackURL lạ. Đăng nhập thật cần khóa thật.
 */
const OAUTH_ENV = {
  GOOGLE_CLIENT_ID: "google-id-gia",
  GOOGLE_CLIENT_SECRET: "google-secret-gia",
  GITHUB_CLIENT_ID: "github-id-gia",
  GITHUB_CLIENT_SECRET: "github-secret-gia",
};

describe("Đăng nhập Google/GitHub (khóa giả)", () => {
  let app: NestExpressApplication;
  const saved: Record<string, string | undefined> = {};

  const http = () => request(app.getHttpServer());

  function startSocial(provider: string, callbackURL: string, origin = "http://localhost:3000") {
    return http()
      .post("/api/auth/sign-in/social")
      .set("Origin", origin)
      .send({ provider, callbackURL, disableRedirect: true });
  }

  beforeAll(async () => {
    for (const [key, value] of Object.entries(OAUTH_ENV)) {
      saved[key] = process.env[key];
      process.env[key] = value;
    }
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
    for (const [key, value] of Object.entries(saved)) process.env[key] = value;
  });

  it("có khóa thì /auth/providers bật Google và GitHub", async () => {
    const res = await http().get("/api/v1/auth/providers").expect(200);

    expect(res.body.data).toEqual({ email: true, google: true, github: true });
  });

  it.each([
    [
      "github",
      "https://github.com/login/oauth/authorize",
      "http://localhost:4000/api/auth/callback/github",
    ],
    [
      "google",
      "https://accounts.google.com/o/oauth2",
      "http://localhost:4000/api/auth/callback/google",
    ],
  ])(
    "%s: trả link sang nhà cung cấp, link quay về đúng /api/auth/callback",
    async (provider, authorizeUrl, redirectUri) => {
      const res = await startSocial(provider, "http://localhost:3000/").expect(200);

      expect(res.body.url).toContain(authorizeUrl);
      expect(new URL(res.body.url).searchParams.get("redirect_uri")).toBe(redirectUri);
    },
  );

  it("callbackURL trỏ ra trang lạ bị chặn (chống chuyển hướng mở)", async () => {
    const res = await startSocial("github", "https://trang-la.example/lay-phien");

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("INVALID_CALLBACK_URL");
  });

  it("app Expo Go khi dev (exp://) được quay về", async () => {
    await startSocial("github", "exp://192.168.1.5:8081/--/", "exp://192.168.1.5:8081").expect(200);
  });

  it("nhà cung cấp chưa cấu hình thì báo PROVIDER_NOT_FOUND", async () => {
    const res = await startSocial("facebook", "http://localhost:3000/");

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("PROVIDER_NOT_FOUND");
  });
});
