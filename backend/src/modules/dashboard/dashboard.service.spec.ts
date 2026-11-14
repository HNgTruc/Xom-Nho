import type { DailyCounts, DashboardRepository } from "./dashboard.repository.js";
import { DashboardService, VN_OFFSET_MINUTES } from "./dashboard.service.js";

function setup(counts: Partial<DailyCounts> = {}, hidden = { posts: 0, comments: 0 }) {
  const repository = {
    countDaily: vi.fn().mockResolvedValue({ posts: [], comments: [], members: [], ...counts }),
    countHidden: vi.fn().mockResolvedValue(hidden),
  };
  const service = new DashboardService(repository as unknown as DashboardRepository);
  return { service, repository };
}

/** Chạy `fn` với giờ hệ thống cố định. */
async function at<T>(iso: string, fn: () => Promise<T>): Promise<T> {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
  try {
    return await fn();
  } finally {
    vi.useRealTimers();
  }
}

describe("DashboardService.get", () => {
  it("đủ 30 ngày giờ Việt Nam, cũ trước, ngày cuối là hôm nay; ngày trống là 0", async () => {
    const { service, repository } = setup({
      posts: [
        { day: "2026-11-15", count: 3 },
        { day: "2026-10-17", count: 1 },
      ],
      members: [{ day: "2026-11-01", count: 2 }],
    });

    // 20:00 UTC ngày 14/11 = 03:00 sáng 15/11 ở Việt Nam
    const result = await at("2026-11-14T20:00:00.000Z", () => service.get());

    // Đầu chuỗi: 0 giờ 17/10 giờ Việt Nam = 17:00 UTC ngày 16/10
    expect(repository.countDaily).toHaveBeenCalledWith(
      new Date("2026-10-16T17:00:00.000Z"),
      VN_OFFSET_MINUTES,
    );
    expect(result.daily).toHaveLength(30);
    expect(result.daily[0]).toEqual({ date: "2026-10-17", posts: 1, comments: 0, members: 0 });
    expect(result.daily[29]).toEqual({ date: "2026-11-15", posts: 3, comments: 0, members: 0 });
    expect(result.daily.find((day) => day.date === "2026-11-01")?.members).toBe(2);
    expect(result.generatedAt).toBe("2026-11-14T20:00:00.000Z");
  });

  it("ngày nối tiếp nhau, không trùng, không sót", async () => {
    const { service } = setup();

    const { daily } = await at("2026-11-15T05:00:00.000Z", () => service.get());

    const dates = daily.map((day) => day.date);
    expect(new Set(dates).size).toBe(30);
    for (let i = 1; i < dates.length; i++) {
      const gap = Date.parse(dates[i]) - Date.parse(dates[i - 1]);
      expect(gap).toBe(24 * 60 * 60 * 1000);
    }
  });

  it("thẻ số liệu: 7 ngày cuối so với 7 ngày liền trước, ngày cũ hơn không tính", async () => {
    const { service } = setup({
      comments: [
        { day: "2026-11-15", count: 4 }, // hôm nay: trong 7 ngày gần nhất
        { day: "2026-11-09", count: 6 }, // ngày đầu của 7 ngày gần nhất
        { day: "2026-11-08", count: 5 }, // ngày cuối của 7 ngày trước đó
        { day: "2026-11-02", count: 2 }, // ngày đầu của 7 ngày trước đó
        { day: "2026-11-01", count: 100 }, // cũ hơn: chỉ có trên biểu đồ
      ],
    });

    const result = await at("2026-11-15T05:00:00.000Z", () => service.get());

    expect(result.recent).toEqual({
      posts: { current: 0, previous: 0 },
      comments: { current: 10, previous: 7 },
      members: { current: 0, previous: 0 },
    });
  });

  it("trả số đang ẩn từ repository", async () => {
    const { service } = setup({}, { posts: 3, comments: 5 });

    const result = await service.get();

    expect(result.hidden).toEqual({ posts: 3, comments: 5 });
  });
});
