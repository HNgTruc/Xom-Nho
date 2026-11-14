import { Controller, Get } from "@nestjs/common";
import { type AdminDashboard, ROLES } from "@xom-nho/api";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { DashboardService } from "./dashboard.service.js";

/** Màn Tổng quan của trang quản trị (docs/api.md mục "Tổng quan"). Chỉ đọc, chỉ trưởng xóm. */
@Controller("admin/dashboard")
@Roles(ROLES.ADMIN)
export class DashboardAdminController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  get(): Promise<AdminDashboard> {
    return this.dashboardService.get();
  }
}
