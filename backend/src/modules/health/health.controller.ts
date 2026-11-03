import { Controller, Get } from "@nestjs/common";
import type { HealthStatus } from "@xom-nho/shared";
import { Public } from "../../common/decorators/public.decorator.js";
import { HealthService } from "./health.service.js";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  check(): Promise<HealthStatus> {
    return this.healthService.check();
  }
}
