/** Số kiểu Việt Nam ("1.234") cho thẻ số liệu, biểu đồ, danh sách của màn Tổng quan. */
export const numberFormat = new Intl.NumberFormat("vi-VN");

/** `2026-11-15` → `15/11` */
export function shortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(day)}/${Number(month)}`;
}
