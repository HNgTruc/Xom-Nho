# 0009. Thêm nút Không thích, số hiện công khai

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-13

## Bối cảnh

Bài chỉ có Thích, Bình luận và lượt xem. Chủ dự án muốn trang quản trị thống kê bài theo tương tác, có cả **tương tác tiêu cực**, để trưởng xóm thấy bài nào bị hàng xóm phản đối. Xóm Nhỏ chưa có tín hiệu tiêu cực nào ngoài việc trưởng xóm tự ẩn bài.

## Quyết định

- Thêm nút **Không thích** cho mọi thành viên không bị cấm, chỉ với bài đã đăng, như Thích (ADR 0008 cho đăng thẳng, nên tín hiệu này đến từ hàng xóm thay vì từ khâu duyệt).
- **Số Không thích hiện công khai** trên thẻ bài và trang bài, như số Thích (chủ dự án chọn 2026-11-13).
- **Thích và Không thích loại trừ nhau**: mỗi người chọn một trong hai cho một bài. Bấm Không thích thì tự bỏ Thích và ngược lại, trong cùng một transaction.
- Lưu ở bảng mới `PostDislike` (khóa chính `postId, userId`), giống `PostLike`. API: `PUT`/`DELETE /posts/:id/dislike`; `PostListItem`, `PostDetail`, `PostLikeState` có thêm `dislikeCount`, `dislikedByMe` (chỉ thêm trường, đúng quy tắc API v1).
- Giới hạn tần suất dùng chung bộ đếm với Thích (60 lần / phút / người).

Phương án đã cân nhắc:

- **Chỉ trưởng xóm thấy số Không thích:** giảm cảnh dồn "không thích" làm người viết buồn, nhưng chủ dự án muốn hàng xóm cũng thấy.
- **Không thêm dislike, dùng tín hiệu sẵn có** (bình luận bị ẩn, bài từng bị ẩn): không cần tính năng mới, nhưng không cho hàng xóm tự bày tỏ.
- **Đổi `PostLike` thành `PostReaction` có cột loại:** gọn một bảng, nhưng phải đổi dữ liệu và truy vấn đang chạy. Bảng riêng không đụng gì của Thích.
- **Cho bấm cả hai:** số liệu khó hiểu (một người vừa ủng hộ vừa phản đối).

## Hệ quả

- Cần migration mới, cập nhật `docs/co-so-du-lieu.md`, `docs/api.md`, `docs/phan-quyen.md`, `docs/tinh-nang.md` mục 2.6.
- Web: nút Không thích cạnh nút Thích (MASTER). App làm ở giai đoạn 6.
- Số Không thích công khai có thể khiến hàng xóm ngại đăng bài hoặc bị dồn phản đối. Theo dõi sau khi mở cho nhiều người; muốn giấu số thì chỉ cần đổi giao diện và mapper, dữ liệu giữ nguyên.
- Thống kê ở trang quản trị (màn Bài viết) xếp được theo Không thích.
