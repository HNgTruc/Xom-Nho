import { loadEnv } from "./load-env.js";

const validEnv = { DATABASE_URL: "mysql://u:p@localhost:3307/xom_nho" };

describe("loadEnv", () => {
  it("điền giá trị mặc định cho biến không bắt buộc", () => {
    const env = loadEnv(validEnv);

    expect(env).toMatchObject({ NODE_ENV: "development", PORT: 4000, CORS_ORIGINS: [] });
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
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });

  it("dừng khi DATABASE_URL không phải MySQL", () => {
    expect(() => loadEnv({ DATABASE_URL: "postgres://u:p@h/db" })).toThrow(/mysql:\/\//);
  });
});
