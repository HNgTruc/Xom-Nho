import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types.js";
import { AppModule } from "../../src/app.module.js";
import { setupApp } from "../../src/setup-app.js";

describe("GET /api/v1/health", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("trả 200 và status ok", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health").expect(200);

    expect(res.body.status).toBe("ok");
  });

  it("không có route ngoài tiền tố /api/v1", async () => {
    await request(app.getHttpServer()).get("/health").expect(404);
  });
});
