# 0008. Mọi thành viên đăng bài thẳng, soạn bài kiểu mạng xã hội

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-11

## Bối cảnh

Trước đây bài của hàng xóm (`user`) phải chờ trưởng xóm duyệt; chỉ cây bút và trưởng xóm đăng thẳng. Bài kiểu diễn đàn: tiêu đề bắt buộc, nội dung Markdown. Chủ dự án muốn trang chủ có ô **tạo bài** như mạng xã hội, bài kèm được ảnh và video, và chọn: **ai cũng đăng thẳng**, tiêu đề không bắt buộc, tối đa 10 ảnh/video mỗi bài.

Xóm Nhỏ chỉ thành viên mới đọc được (ADR 0007), nên bài đăng thẳng không lộ ra ngoài; rủi ro chỉ nằm trong xóm.

## Quyết định

- `POST /api/v1/posts` tạo bài `PUBLISHED` ngay cho mọi vai trò (`user`, `author`, `admin`). Người bị cấm đã bị AuthGuard chặn (403).
- Bài soạn ở trang chủ lưu `contentFormat = PLAIN`: chữ thường, giữ xuống dòng, không phải Markdown (không có tiêu đề cấp, in đậm). Bài cũ giữ `MARKDOWN`. Web render chữ thường bằng React (tự thoát ký tự), không qua bộ render Markdown.
- Tiêu đề tùy chọn, lưu chuỗi rỗng khi bỏ trống: thẻ bài hiện phần đầu nội dung làm chữ chính; slug lấy từ vài từ đầu nội dung (bài chỉ có ảnh: `bai-viet`, `bai-viet-2`...).
- Ảnh, video tải lên trước qua `POST /files` (ADR 0005), bài gắn bằng `mediaIds` (tối đa 10, theo thứ tự). Bảng `media`, gắn trong cùng transaction với tạo bài: file phải của chính người đăng và chưa gắn bài nào.
- Giới hạn tần suất (bộ nhớ, `infrastructure/rate-limit`): 10 bài / 10 phút, 30 file / 10 phút mỗi người.
- Trưởng xóm vẫn ẩn được bài (`ARCHIVED`) ở app admin sau khi có vấn đề. Các trạng thái `DRAFT`, `PENDING`, `REJECTED` giữ trong schema (bài cũ, trình soạn Markdown sau này nếu cần), nhưng luồng soạn hiện tại không dùng.

Phương án đã cân nhắc:

- **Giữ chờ duyệt cho hàng xóm:** an toàn hơn nhưng chậm, không giống trải nghiệm mạng xã hội chủ dự án muốn.
- **Giữ kiểu diễn đàn (tiêu đề bắt buộc, Markdown):** hợp bài dài, nhưng nặng tay cho bài ngắn kèm ảnh. Có thể thêm lại sau như một trình soạn riêng (`contentFormat = MARKDOWN`).

## Hệ quả

- Ma trận quyền đổi: "Viết bài" và "Sửa bài của mình" không còn chờ duyệt (docs/phan-quyen.md). Câu "Đã gửi! Trưởng xóm sẽ xem và duyệt sớm." tạm không dùng.
- Kiểm duyệt dựa vào ẩn bài sau khi đăng; cần nút báo cáo bài và trang quản trị ẩn bài (giai đoạn 5) trước khi mở cho nhiều người.
- File đã tải lên nhưng không gắn bài (người dùng gỡ ra, đóng hộp soạn) còn trên đĩa: cần việc dọn định kỳ file chưa gắn quá 1 ngày (ghi ở lo-trinh).
- Tìm kiếm chỉ tìm trong tiêu đề, tóm tắt (160 ký tự đầu) và tag; phần sau của bài dài không tìm được.
- Muốn bật lại duyệt bài: đổi `status` trong `PostsService.create` theo vai trò, sửa ma trận quyền, viết ADR thay thế.
