import { loadEnv } from "./load-env.js";

const validEnv = {
  DATABASE_URL: "mysql://u:p@localhost:3307/xom_nho",
  BETTER_AUTH_SECRET: "a".repeat(32),
};

describe("loadEnv", () => {
  it("điền giá trị mặc định cho biến không bắt buộc", () => {
    const env = loadEnv(validEnv);

    expect(env).toMatchObject({
      NODE_ENV: "development",
      PORT: 4000,
      CORS_ORIGINS: [],
      BETTER_AUTH_URL: "http://localhost:4000",
      MOBILE_APP_SCHEME: "xomnho",
    });
  });

  it("ép PORT sang số và tách CORS_ORIGINS theo dấu phẩy", () => {
    const env = loadEnv({
      ...validEnv,
      PORT: "5000",
      CORS_ORIGINS: "http://localhost:3000, http://localhost:5173,",
    });

    expect(env.PORT).toBe(5000);
    expect(env.CORS_ORIGINS).toEqual(["http://localhost:3000", "http://localhost:5173"]);
  });

  it("dừng khi thiếu DATABASE_URL", () => {
    expect(() => loadEnv({ BETTER_AUTH_SECRET: validEnv.BETTER_AUTH_SECRET })).toThrow(
      /DATABASE_URL/,
    );
  });

  it("dừng khi DATABASE_URL không phải MySQL", () => {
    expect(() => loadEnv({ ...validEnv, DATABASE_URL: "postgres://u:p@h/db" })).toThrow(
      /mysql:\/\//,
    );
  });

  it("dừng khi BETTER_AUTH_SECRET thiếu hoặc quá ngắn", () => {
    expect(() => loadEnv({ DATABASE_URL: validEnv.DATABASE_URL })).toThrow(/BETTER_AUTH_SECRET/);
    expect(() => loadEnv({ ...validEnv, BETTER_AUTH_SECRET: "ngan" })).toThrow(/32 ký tự/);
  });

  it("khóa OAuth để trống coi như không đặt", () => {
    const env = loadEnv({ ...validEnv, GOOGLE_CLIENT_ID: "", GITHUB_CLIENT_ID: "  " });

    expect(env.GOOGLE_CLIENT_ID).toBeUndefined();
    expect(env.GITHUB_CLIENT_ID).toBeUndefined();
  });
});
