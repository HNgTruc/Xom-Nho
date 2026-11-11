const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Việt Nam dùng UTC+7 quanh năm (không có giờ mùa hè). Tính cố định để server, trình duyệt, app ra cùng một ngày. */
const VIETNAM_OFFSET = 7 * HOUR;

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** Ngày theo giờ Việt Nam: "3 tháng 11, 2026". Bỏ năm nếu `now` cùng năm: "3 tháng 11". */
export function formatDate(value: string | Date, now?: Date): string {
  const local = new Date(toDate(value).getTime() + VIETNAM_OFFSET);
  const day = local.getUTCDate();
  const month = local.getUTCMonth() + 1;
  const year = local.getUTCFullYear();
  const sameYear = now && new Date(now.getTime() + VIETNAM_OFFSET).getUTCFullYear() === year;
  return sameYear ? `${day} tháng ${month}` : `${day} tháng ${month}, ${year}`;
}

/**
 * Thời gian tương đối cho feed và bình luận (MASTER mục 7): "Vừa xong", "5 phút trước", "2 giờ trước",
 * "3 ngày trước"; từ 7 ngày trở lên thì hiện ngày ("3 tháng 11"). `now` truyền vào để dễ test và để
 * server, client tính cùng một mốc.
 */
export function formatRelativeTime(value: string | Date, now: Date): string {
  const date = toDate(value);
  const diff = now.getTime() - date.getTime();

  // Đồng hồ máy lệch có thể làm thời điểm nằm ở tương lai: coi như vừa xong
  if (diff < MINUTE) return "Vừa xong";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} phút trước`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} giờ trước`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} ngày trước`;
  return formatDate(date, now);
}
