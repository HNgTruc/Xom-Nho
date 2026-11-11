/**
 * Bỏ dấu tiếng Việt, đổi `đ/Đ` thành `d/D`, giữ nguyên chữ hoa/thường.
 * Nhận cả chuỗi dựng sẵn (NFC) lẫn chuỗi tổ hợp (NFD, hay gặp khi dán từ macOS).
 */
export function removeVietnameseTones(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}

/**
 * Chuẩn hóa chữ để tìm kiếm: bỏ dấu, chữ thường, gộp khoảng trắng.
 * Dùng cho cả cột `Post.searchText` lẫn từ khóa người dùng gõ, để "ban tron" khớp "Bàn Tròn".
 */
export function toSearchText(text: string): string {
  return removeVietnameseTones(text).toLowerCase().replace(/\s+/g, " ").trim();
}
