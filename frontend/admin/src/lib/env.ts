/** Địa chỉ backend (cùng giá trị `lib/api.ts` dùng), để dựng link ảnh đại diện, file. */
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/** Địa chỉ web Xóm Nhỏ, cho "Mở Xóm Nhỏ" và "Mở trên Xóm Nhỏ" (.env.example: `VITE_WEB_URL`). */
export const WEB_URL = import.meta.env.VITE_WEB_URL ?? "http://localhost:3000";
