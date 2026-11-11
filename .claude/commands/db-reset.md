---
description: Làm mới database dev (xóa dữ liệu, chạy lại migration và seed)
---

# Làm mới database dev

Lệnh này **xóa toàn bộ dữ liệu** trong database dev. Chỉ dùng trên máy cá nhân.

1. Nói rõ cho người dùng: sẽ xóa sạch dữ liệu trong `xom_nho` rồi tạo lại từ migration và seed. Hỏi xác nhận và **chờ trả lời "có"**.
2. `pnpm db:ps`. MySQL chưa chạy hoặc chưa `healthy` thì `pnpm db:up` và chờ.
3. Hỏi người dùng xác nhận `DATABASE_URL` trong `backend/.env` trỏ vào `localhost:3307` (không tự đọc file `.env`). Nếu trỏ chỗ khác thì **dừng lại**.
4. Chạy: `pnpm --filter backend exec prisma migrate reset --force` (tự chạy seed nếu đã cấu hình).
5. Báo kết quả: số migration đã áp dụng, seed có lỗi không, tài khoản mẫu để đăng nhập (đọc từ `backend/scripts/seed.ts`), gồm tài khoản trưởng xóm để vào admin.

Muốn xóa luôn volume Docker (khi đổi `MYSQL_USER` hoặc cấu hình MySQL): hướng dẫn người dùng **tự chạy** `pnpm db:compose down -v` rồi `pnpm db:up`; không tự chạy.
