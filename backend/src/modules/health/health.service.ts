import { Injectable } from "@nestjs/common";
import type { HealthStatus } from "@xom-nho/api";
import { HealthRepository } from "./health.repository.js";

@Injectable()
export class HealthService {
  constructor(private readonly healthRepository: HealthRepository) {}

  /** Không kết nối được database thì lỗi văng lên filter, trả 500. */
  async check(): Promise<HealthStatus> {
    await this.healthRepository.ping();
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
