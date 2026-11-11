---
paths:
  - "frontend/**/*.tsx"
  - "api/src/constants/messages.ts"
  - "api/src/schemas/**"
  - "backend/src/modules/**/*.service.ts"
---

# Quy tắc chữ hiển thị

Khi viết chữ người dùng sẽ thấy (nút, tiêu đề, thông báo, lỗi, trang trống, thông điệp lỗi từ backend):

- Theo `docs/giong-van-va-giao-dien.md`: xưng "bạn", câu ngắn, thân thiện, không cợt nhả.
- Dùng đúng bảng từ vựng thống nhất (Bài viết, Bình luận, Danh mục, Bản nháp, Chờ duyệt...).
- Câu dùng ở nhiều nơi (web, admin, mobile, backend) đặt trong `api/src/constants/messages.ts`.
- Thông báo lỗi nói chuyện gì xảy ra và làm gì tiếp; không hiện mã lỗi kỹ thuật hay chữ tiếng Anh.
- Nút ghi hành động cụ thể ("Đăng bài", "Duyệt bài"), không "OK", "Submit".
- Trang admin có thể ngắn gọn, trung tính hơn; không dùng cách gọi "hàng xóm" trong thông báo hệ thống của admin.
- Không dùng dấu gạch ngang dài (—) trong câu; dùng dấu phẩy, dấu hai chấm hoặc tách câu.
