import { Controller, Get } from "@nestjs/common";
import type { HealthStatus } from "@xom-nho/shared";

@Controller("health")
export class HealthController {
  // TODO(giai đoạn 1): kiểm tra kết nối database khi đã có PrismaService; @Public() khi đã có AuthGuard
  @Get()
  check(): HealthStatus {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
