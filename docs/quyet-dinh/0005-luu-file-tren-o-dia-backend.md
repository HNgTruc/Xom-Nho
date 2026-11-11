# 0005. Lưu ảnh và video trên ổ đĩa của backend

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-11

## Bối cảnh

Hồ sơ cần ảnh đại diện và ảnh bìa; tin nhắn riêng cần gửi ảnh và video. Trước đây "Tải ảnh lên" nằm ở mục "Để sau" của `tinh-nang.md` (ảnh chỉ dán URL). Đây là project cá nhân, chưa deploy, chưa có tài khoản dịch vụ cloud nào.

Giới hạn do chủ dự án chọn: ảnh JPG/PNG/WebP tối đa **5 MB**, video MP4/WebM tối đa **25 MB**, tối đa 4 file mỗi tin nhắn.

## Quyết định

Lưu file trong thư mục `uploads/` của backend (đường dẫn lấy từ biến môi trường, mặc định `backend/uploads/`, nằm trong `.gitignore`). Nhận file bằng multer (có sẵn trong `@nestjs/platform-express`, không thêm thư viện).

- Mọi file đi qua một lớp `StorageService` (`infrastructure/storage`) với các hàm `save`, `open`, `remove`. Đổi sang cloud sau này chỉ cần viết lại lớp này.
- Kiểm tra loại file bằng **chữ ký nhị phân** (vài byte đầu), không tin đuôi file hay `Content-Type` do trình duyệt gửi. Tên file trên đĩa là id ngẫu nhiên, không dùng tên gốc.
- Ảnh hồ sơ (công khai): phục vụ qua `GET /api/v1/files/:id`, có cache dài.
- File trong tin nhắn riêng: cùng endpoint đó nhưng **kiểm tra quyền** (chỉ hai người trong cuộc trò chuyện), `Cache-Control: private`.
- Giới hạn tần suất tải lên theo người dùng.

Phương án đã cân nhắc:

- **Cloudflare R2 / S3**: deploy đâu cũng được, nhưng cần tài khoản, khóa API và thêm `@aws-sdk/client-s3`. Chưa cần lúc này.
- **Cloudinary**: tự nén, tự đổi định dạng video, nhưng phụ thuộc gói miễn phí có hạn mức, và file riêng tư phải ký URL.

## Hệ quả

- Không tốn tiền, không cần tài khoản ngoài, chạy được ngay trên máy.
- Không nén hay đổi cỡ ảnh ở backend: web hiển thị qua `next/image` (tự đổi cỡ); video giữ nguyên file gốc.
- Khi deploy cần ổ đĩa lưu lâu dài (volume) và sao lưu thư mục `uploads/`; chạy nhiều bản backend cùng lúc thì phải chuyển sang lưu trữ dùng chung (cloud). Ghi lại ở giai đoạn Hoàn thiện của `lo-trinh.md`.
- Xóa tin nhắn, đổi ảnh đại diện thì phải xóa file cũ (dọn rác).
