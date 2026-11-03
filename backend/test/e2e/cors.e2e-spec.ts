import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types.js";
import { createTestApp } from "../fixtures/app.js";

describe("CORS", () => {
  let app: INestApplication<App>;
  const allowedOrigin = "http://localhost:5173";

  beforeAll(async () => {
    process.env.CORS_ORIGINS = `http://localhost:3000,${allowedOrigin}`;
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("cho phép origin trong CORS_ORIGINS, kèm cookie", async () => {
    const res = await request(app.getHttpServer())
      .options("/api/v1/health")
      .set("Origin", allowedOrigin)
      .set("Access-Control-Request-Method", "GET")
      .expect(204);

    expect(res.headers["access-control-allow-origin"]).toBe(allowedOrigin);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("không trả header CORS cho origin lạ", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/health")
      .set("Origin", "https://trang-la.example");

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
