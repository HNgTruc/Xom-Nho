---
paths:
  - "shared/**"
---

# Quy tắc shared

- Code ở đây chạy ở **bốn nơi**: backend (Node), web (trình duyệt + Node), admin (trình duyệt), mobile (React Native). Không import `next`, `react`, `react-native`, `expo-*`, `@nestjs/*`, `@prisma/client`, `node:*`.
- Phụ thuộc duy nhất được phép: `zod`.
- Không đọc biến môi trường, không có side effect khi import.
- `api-client` chỉ dùng `fetch` chuẩn; nhận `baseUrl`, `fetch`, `headers`, `credentials` từ nơi tạo client. Mỗi tài nguyên một file; route admin trong `api-client/admin/`.
- `api-client` và `types/` phải khớp `docs/api.md`. Đổi một nơi thì đổi cả ba (backend, `docs/api.md`, `shared`).
- Mỗi schema Zod export kèm kiểu: `export type CreatePostInput = z.infer<typeof createPostSchema>`.
- Thông báo lỗi trong schema viết tiếng Việt. Giới hạn (độ dài, số tag) lấy từ `constants/limits.ts`.
- Đổi export công khai sẽ ảnh hưởng tới backend và cả ba frontend: tìm mọi chỗ dùng, sửa cùng lúc, chạy `pnpm typecheck` ở gốc.
- Tiện ích có test cạnh file, gồm ca tiếng Việt khó: `đ/Đ`, chuỗi NFD, khoảng trắng thừa, ký tự đặc biệt.
