---
name: tao-tinh-nang
description: Quy trình làm một tính năng trọn vẹn cho Xóm Nhỏ, đi qua shared → database → backend → api-client → web / mobile-app / admin. Dùng khi người dùng muốn làm một tính năng mới (ví dụ "làm bình luận", "thêm lưu bài", "làm tìm kiếm") hoặc một việc trong docs/lo-trinh.md đụng nhiều phần.
---

# Làm một tính năng trọn vẹn

Làm từ trong ra ngoài: hợp đồng dữ liệu trước, backend sau, giao diện cuối. Nhờ vậy cả ba frontend dùng cùng một API và TypeScript báo lỗi khi lệch.

## 0. Hiểu rõ trước khi code

- Đọc mục tương ứng trong `docs/tinh-nang.md` (tiêu chí) và `docs/phan-quyen.md` (ai được làm gì).
- Chưa có trong tài liệu: hỏi các điểm chưa rõ, **đề xuất bổ sung tài liệu trước**.
- Lập kế hoạch: phần nào đổi (shared, backend, web, admin, mobile), file nào tạo mới. Xác nhận với người dùng nếu đổi schema DB hoặc đụng hơn khoảng 10 file.

## 1. shared (hợp đồng)

- Schema Zod dữ liệu vào: `shared/src/schemas/<tài-nguyên>.ts`, export kèm kiểu `z.infer`.
- Kiểu phản hồi: `shared/src/types/`.
- Giới hạn vào `constants/limits.ts`; câu chữ dùng chung vào `constants/messages.ts`.
- Cập nhật `docs/api.md` (endpoint, quyền, body, kiểu trả về).
- Test schema.

## 2. Database (nếu cần)

Skill `prisma-migration`.

## 3. backend

Skill `tao-module-backend`: policy → repository → service → controller (và admin controller nếu có) → test.

## 4. api-client

Thêm hàm vào `shared/src/api-client/<tài-nguyên>.ts` (hoặc `api-client/admin/`). Chạy `pnpm typecheck` ở gốc.

## 5. Frontend (theo phạm vi trong `docs/tinh-nang.md`)

- **web**: feature trong `frontend/web/src/features/<tính-năng>/` + route trong `src/app/`. Theo `.claude/rules/frontend-web.md`.
- **admin** (nếu có phần quản trị): skill `trang-admin-crud`.
- **mobile-app**: skill `man-hinh-mobile`.
- Thiếu component nền: skill `them-component-ui`.

## 6. Hoàn tất

- `pnpm typecheck`, `pnpm lint`, `pnpm test` ở gốc.
- Đối chiếu từng tiêu chí trong `docs/tinh-nang.md`, đánh `[x]` cái đã đạt; đánh dấu `docs/lo-trinh.md`.
- Tóm tắt: đã làm gì ở từng phần, cách thử bằng tay (web, admin, Expo Go), việc còn lại.
- Gợi ý chạy agent `kiem-tra-bao-mat` nếu tính năng có ghi dữ liệu.

Có thể dừng giữa chừng (ví dụ xong backend + web) để người dùng thử trước, rồi làm tiếp admin và mobile.
