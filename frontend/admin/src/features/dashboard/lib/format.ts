/** `2026-11-15` → `15/11` */
export function shortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(day)}/${Number(month)}`;
}
