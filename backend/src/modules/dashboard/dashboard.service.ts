import { Injectable } from "@nestjs/common";
import {
  ADMIN_DASHBOARD_DAYS,
  ADMIN_DASHBOARD_METRIC_VALUES,
  ADMIN_DASHBOARD_RECENT_DAYS,
  type AdminDashboard,
  type AdminDashboardDay,
  type AdminDashboardMetric,
  type AdminDashboardTrend,
} from "@xom-nho/api";
import { DashboardRepository, type DayCountRow } from "./dashboard.repository.js";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Giờ Việt Nam (UTC+7, không đổi giờ theo mùa): "hôm nay" của trưởng xóm bắt đầu lúc 0 giờ ở Việt Nam. */
export const VN_OFFSET_MINUTES = 7 * 60;
const VN_OFFSET_MS = VN_OFFSET_MINUTES * 60 * 1000;

/** `YYYY-MM-DD` theo giờ Việt Nam của một thời điểm. */
function vnDay(instant: Date): string {
  return new Date(instant.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

/** Thời điểm (UTC) lúc 0 giờ ngày hôm nay theo giờ Việt Nam. */
function startOfVnDay(now: Date): Date {
  const shifted = now.getTime() + VN_OFFSET_MS;
  return new Date(shifted - (shifted % DAY_MS) - VN_OFFSET_MS);
}

function toMap(rows: DayCountRow[]): Map<string, number> {
  return new Map(rows.map((row) => [row.day, row.count]));
}

function sum(days: AdminDashboardDay[], metric: AdminDashboardMetric): number {
  return days.reduce((total, day) => total + day[metric], 0);
}

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  /**
   * Màn Tổng quan (docs/tinh-nang.md mục 4.1): số theo từng ngày trong 30 ngày, tính cả hôm nay, giờ Việt Nam;
   * ngày không có gì vẫn có mặt với số 0 để biểu đồ đủ cột. Thẻ số liệu cộng từ chính chuỗi ngày đó (7 ngày cuối
   * so với 7 ngày liền trước) nên số trên thẻ luôn khớp với cột.
   */
  async get(): Promise<AdminDashboard> {
    const now = new Date();
    const from = new Date(startOfVnDay(now).getTime() - (ADMIN_DASHBOARD_DAYS - 1) * DAY_MS);
    const [counts, hidden] = await Promise.all([
      this.dashboardRepository.countDaily(from, VN_OFFSET_MINUTES),
      this.dashboardRepository.countHidden(),
    ]);
    const posts = toMap(counts.posts);
    const comments = toMap(counts.comments);
    const members = toMap(counts.members);

    const daily = Array.from({ length: ADMIN_DASHBOARD_DAYS }, (_, index) => {
      const date = vnDay(new Date(from.getTime() + index * DAY_MS));
      return {
        date,
        posts: posts.get(date) ?? 0,
        comments: comments.get(date) ?? 0,
        members: members.get(date) ?? 0,
      };
    });
    const current = daily.slice(-ADMIN_DASHBOARD_RECENT_DAYS);
    const previous = daily.slice(-2 * ADMIN_DASHBOARD_RECENT_DAYS, -ADMIN_DASHBOARD_RECENT_DAYS);
    const recent = Object.fromEntries(
      ADMIN_DASHBOARD_METRIC_VALUES.map((metric) => [
        metric,
        { current: sum(current, metric), previous: sum(previous, metric) },
      ]),
    ) as Record<AdminDashboardMetric, AdminDashboardTrend>;

    return { generatedAt: now.toISOString(), hidden, recent, daily };
  }
}
