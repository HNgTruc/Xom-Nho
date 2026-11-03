# Tính năng

Mỗi tính năng có: mô tả, nền tảng (🌐 web, 📱 mobile-app, 🛠️ admin), và **tiêu chí hoàn thành**. Chỉ coi là xong khi đạt hết tiêu chí.

## 1. Tài khoản

### 1.1 Đăng ký, đăng nhập bằng email 🌐📱

- Đăng ký với tên, email, mật khẩu (tối thiểu 8 ký tự). Vai trò mặc định `user`.
- Đăng nhập, đăng xuất. Phiên được nhớ giữa các lần mở app.

Tiêu chí:

- [ ] Email trùng báo lỗi rõ bằng tiếng Việt
- [ ] Sai mật khẩu nhiều lần bị chặn tạm thời
- [ ] Đóng mở lại app vẫn còn đăng nhập
- [ ] Tài khoản bị cấm không đăng nhập được, có thông báo lý do

### 1.2 Đăng nhập Google, GitHub 🌐📱

- Nút "Tiếp tục với Google/GitHub". Cùng email thì gộp vào một tài khoản.

Tiêu chí:

- [ ] Chạy được trên web
- [ ] Chạy được trên app (cần cấu hình đường dẫn quay về app)
- [ ] Không có khóa OAuth trong `.env` thì ẩn nút, không lỗi

### 1.3 Hồ sơ 🌐📱

- Trang `/u/<username>`: ảnh, tên, giới thiệu, danh sách bài đã đăng.
- Sửa tên, giới thiệu, ảnh (ảnh qua URL ở giai đoạn đầu).

## 2. Bài viết

### 2.1 Danh sách bài 🌐📱

- Trang chủ: bài mới nhất đã đăng, 10 bài/trang. Có tab "Mới" và "Nhiều người đọc".
- Mỗi bài hiện: tiêu đề, tóm tắt, tác giả, danh mục, tag, ngày, số bình luận.

Tiêu chí:

- [x] Web có thanh phân trang, URL giữ số trang (`?page=3`)
- [ ] App cuộn vô hạn, kéo xuống để làm mới
- [ ] Trang trống có lời nhắn thân thiện (xem `giong-van-va-giao-dien.md`)

### 2.2 Chi tiết bài 🌐📱

- Hiển thị Markdown đã lọc an toàn, mục lục tự động nếu bài dài.
- Đếm lượt xem (mỗi người/phiên tính một lần là đủ).

Tiêu chí:

- [ ] Không chạy được script chèn trong Markdown
- [ ] Web có thẻ meta, Open Graph để chia sẻ link đẹp
- [ ] Bài chưa đăng trả 404 với người không phải tác giả/admin

### 2.3 Viết và sửa bài 🌐📱

- Tiêu đề, danh mục (bắt buộc), tag (tối đa 5), nội dung Markdown, tóm tắt (tự lấy 160 ký tự đầu nếu để trống).
- Có nút xem trước. Lưu nháp hoặc gửi.
- Hàng xóm gửi thì chờ duyệt; cây bút, trưởng xóm thì đăng thẳng.

Tiêu chí:

- [ ] Web: soạn và xem trước cạnh nhau (màn hình rộng) hoặc chuyển tab (màn hình hẹp)
- [ ] App: chuyển tab Soạn / Xem trước
- [ ] Thoát giữa chừng có hỏi lại, không mất bài
- [ ] Bài bị từ chối hiện lý do cho tác giả

### 2.4 Danh mục và tag 🌐📱

- Trang `/danh-muc/<slug>` và `/tag/<slug>` liệt kê bài.

### 2.5 Tìm kiếm 🌐📱

- Ô tìm ở thanh trên (web) và tab Tìm kiếm (app).
- Gõ có dấu hay không dấu đều ra kết quả. Lọc thêm theo danh mục.

Tiêu chí:

- [ ] "ban tron" tìm ra bài có chữ "bàn tròn"
- [ ] "do an" tìm ra "đồ ăn"
- [ ] Từ khóa rỗng không gọi truy vấn
- [ ] Có phân trang

## 3. Bình luận 🌐📱

- Bình luận dưới bài, trả lời một cấp. Sửa, xóa bình luận của mình.
- Hiện "đã sửa" nếu bình luận bị sửa.

Tiêu chí:

- [ ] Trả lời một trả lời vẫn nằm trong cùng nhánh, có "@tên"
- [ ] Bình luận bị ẩn không hiện với người thường, hiện mờ với admin
- [ ] Gửi liên tục bị giới hạn tần suất
- [ ] Nội dung bình luận hiển thị dạng chữ thường (không render Markdown, không HTML)

## 4. Quản trị 🛠️ (app admin riêng, `frontend/admin`)

### 4.1 Tổng quan

- Số liệu: bài chờ duyệt, bài/bình luận mới trong 7 ngày, thành viên mới.

### 4.2 Duyệt bài

- Hàng chờ bài `PENDING`, xem trước, Duyệt / Từ chối (bắt buộc ghi lý do).

### 4.3 Quản lý bài, bình luận

- Bảng bài: lọc theo trạng thái, danh mục, tác giả; tìm theo tiêu đề; sửa, xóa, ẩn.
- Bảng bình luận: ẩn / hiện, xem bài gốc.

### 4.4 Danh mục, tag

- Thêm, sửa, sắp xếp danh mục. Gộp tag trùng nghĩa.

### 4.5 Thành viên

- Danh sách, tìm theo tên/email, đổi vai trò, cấm / bỏ cấm (kèm lý do).

Tiêu chí chung cho admin:

- [ ] Người không phải admin đăng nhập vào app admin bị từ chối; gọi thẳng `/api/v1/admin/*` nhận 403
- [ ] Mọi bảng có phân trang, lọc, tìm
- [ ] Thao tác xóa có hộp xác nhận
- [ ] Admin không tự hạ quyền hoặc tự cấm chính mình

## Để sau (chưa làm)

- Tải ảnh lên (bìa bài, ảnh trong bài, ảnh đại diện)
- Thông báo khi có người trả lời
- Thích / lưu bài
- Báo cáo vi phạm
- Chế độ tối cho app
- Deploy (web lên Vercel hoặc VPS, MySQL trên dịch vụ cloud, app build bằng EAS)
