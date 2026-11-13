import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatRelativeTime } from "./format-time.js";

const now = new Date("2026-11-04T10:00:00.000Z");
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
  it.each([
    [0, "Vừa xong"],
    [59 * 1000, "Vừa xong"],
    [MIN, "1 phút trước"],
    [59 * MIN, "59 phút trước"],
    [HOUR, "1 giờ trước"],
    [23 * HOUR + 59 * MIN, "23 giờ trước"],
    [DAY, "1 ngày trước"],
    [6 * DAY, "6 ngày trước"],
  ])("cách %i ms thì %j", (ms, expected) => {
    expect(formatRelativeTime(ago(ms), now)).toBe(expected);
  });

  it("từ 7 ngày trở lên thì hiện ngày, cùng năm thì bỏ năm", () => {
    expect(formatRelativeTime(ago(7 * DAY), now)).toBe("28 tháng 10");
  });

  it("thời điểm ở tương lai (đồng hồ lệch) thì coi như vừa xong", () => {
    expect(formatRelativeTime(ago(-5 * MIN), now)).toBe("Vừa xong");
  });

  it("nhận cả Date lẫn chuỗi ISO", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 2 * HOUR), now)).toBe("2 giờ trước");
  });
});

describe("formatDate", () => {
  it("tính theo giờ Việt Nam: 18:00 UTC ngày 3 là ngày 4 ở Việt Nam", () => {
    expect(formatDate("2026-11-03T18:00:00.000Z")).toBe("4 tháng 11, 2026");
  });

  it("khác năm thì có năm, cùng năm thì bỏ", () => {
    expect(formatDate("2025-12-31T00:00:00.000Z", now)).toBe("31 tháng 12, 2025");
    expect(formatDate("2026-01-15T00:00:00.000Z", now)).toBe("15 tháng 1");
  });

  it("giao thừa theo giờ Việt Nam: 17:30 UTC ngày 31/12 đã là năm mới", () => {
    expect(formatDate("2025-12-31T17:30:00.000Z", now)).toBe("1 tháng 1");
  });
});

describe("formatDateTime", () => {
  it("giờ phút theo giờ Việt Nam, đủ hai chữ số: 07:05 UTC là 14:05", () => {
    expect(formatDateTime("2026-11-04T07:05:00.000Z", now)).toBe("14:05, 4 tháng 11");
  });

  it("qua nửa đêm theo giờ Việt Nam thì sang ngày mới: 17:00 UTC ngày 3 là 00:00 ngày 4", () => {
    expect(formatDateTime("2026-11-03T17:00:00.000Z", now)).toBe("00:00, 4 tháng 11");
  });

  it("khác năm hoặc không có mốc so sánh thì có năm", () => {
    expect(formatDateTime("2025-12-30T02:09:00.000Z", now)).toBe("09:09, 30 tháng 12, 2025");
    expect(formatDateTime("2026-11-04T07:05:00.000Z")).toBe("14:05, 4 tháng 11, 2026");
  });
});
