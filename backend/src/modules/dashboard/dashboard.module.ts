import { Module } from "@nestjs/common";
import { DashboardAdminController } from "./dashboard.admin.controller.js";
import { DashboardRepository } from "./dashboard.repository.js";
import { DashboardService } from "./dashboard.service.js";

@Module({
  controllers: [DashboardAdminController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
