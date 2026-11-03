import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { App } from "supertest/types.js";
import { createTestApp } from "../fixtures/app.js";

describe("GET /api/v1/health", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("trả 200, bọc trong data, status ok khi database trả lời", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health").expect(200);

    expect(res.body.data.status).toBe("ok");
  });

  it("không có route ngoài tiền tố /api/v1", async () => {
    await request(app.getHttpServer()).get("/health").expect(404);
  });

  it("route không có trong /api/v1 trả 404 đúng định dạng lỗi", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/khong-co").expect(404);

    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: expect.any(String) } });
  });
});
