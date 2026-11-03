/** Chữ cái cho avatar dự phòng: chữ đầu của tên gọi (từ cuối), "Nguyễn Lan Anh" thành "A". */
export function initials(name: string): string {
  const last = name.trim().split(/\s+/).at(-1) ?? "";
  return last.charAt(0).toLocaleUpperCase("vi") || "?";
}
