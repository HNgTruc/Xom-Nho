import { Test } from "@nestjs/testing";
import { HealthController } from "./health.controller.js";
import { HealthRepository } from "./health.repository.js";
import { HealthService } from "./health.service.js";

describe("HealthController", () => {
  let controller: HealthController;
  const ping = vi.fn();

  beforeEach(async () => {
    ping.mockReset();
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService, { provide: HealthRepository, useValue: { ping } }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it("trả về status ok kèm thời điểm ISO khi database trả lời", async () => {
    ping.mockResolvedValue(undefined);

    const result = await controller.check();

    expect(result.status).toBe("ok");
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it("báo lỗi khi không kết nối được database", async () => {
    ping.mockRejectedValue(new Error("connect ECONNREFUSED"));

    await expect(controller.check()).rejects.toThrow();
  });
});
