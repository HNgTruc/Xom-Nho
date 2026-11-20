/**
 * Chữ cái cho avatar dự phòng (web, admin, app): chữ đầu của tên gọi (từ cuối), "Nguyễn Lan Anh" thành "A".
 * Chuẩn hóa NFC trước: tên gõ dạng NFD ("A" + dấu sắc rời) vẫn ra "Á" chứ không mất dấu. Tên rỗng thì "?".
 */
export function initials(name: string): string {
  const last = name.normalize("NFC").trim().split(/\s+/).at(-1) ?? "";
  return last.charAt(0).toLocaleUpperCase("vi") || "?";
}
