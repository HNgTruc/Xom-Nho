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

- Trang `/u/<username>`: ảnh bìa, ảnh đại diện, tên, giới thiệu, nơi ở, số bạn bè, danh sách bài đã đăng.
- Chủ hồ sơ có ô viết bài ngay trên trang (cùng luồng duyệt như mục 2.3).
- Người xem: nút Kết bạn / Hủy lời mời / Bạn bè, nút Nhắn tin.

Tiêu chí:

- [ ] Chưa có ảnh bìa thì hiện nền mặc định, chưa có ảnh đại diện thì hiện chữ cái đầu
- [ ] Số bạn bè chỉ đếm lời mời đã chấp nhận
- [ ] Hồ sơ của người bị cấm vẫn xem được nhưng không kết bạn, không nhắn tin được

### 1.4 Cài đặt tài khoản 🌐📱

- Đã đăng nhập: bấm ảnh đại diện ở header mở menu Hồ sơ, Cài đặt, Đăng xuất.
- Trang `/cai-dat`: sửa tên, giới thiệu, nơi ở; tải ảnh đại diện, ảnh bìa (ảnh JPG/PNG/WebP tối đa 5 MB, [ADR 0005](quyet-dinh/0005-luu-file-tren-o-dia-backend.md)); đổi mật khẩu; chọn ai được nhắn tin thẳng (bạn bè, hay mọi người).

Tiêu chí:

- [ ] File sai loại (đổi đuôi .exe thành .jpg) bị từ chối, có lời báo tiếng Việt
- [ ] File quá 5 MB bị chặn ngay ở trình duyệt, backend cũng chặn
- [ ] Đổi ảnh thì file cũ bị xóa khỏi ổ đĩa

### 1.5 Kết bạn 🌐📱

- Gửi lời mời kết bạn, người nhận chấp nhận hoặc từ chối; người gửi hủy được lời mời; hai bên hủy kết bạn được.
- Trang bạn bè: danh sách bạn, lời mời nhận được, lời mời đã gửi.

Tiêu chí:

- [ ] Không gửi được lời mời cho chính mình hay gửi trùng
- [ ] A mời B trong lúc B cũng mời A thì thành bạn luôn
- [ ] Người bị cấm không gửi, không nhận lời mời được

### 1.6 Hiển thị và trợ năng 🌐

- Trong menu ảnh đại diện: mục "Hiển thị và trợ năng" mở trang con (có nút quay lại) với ba tùy chọn:
  - Chế độ tối: Tắt / Bật / Tự động (theo thiết bị).
  - Hiệu ứng kính: Tự động (theo cài đặt giảm trong suốt của thiết bị) / Luôn bật / Tắt.
  - Giảm chuyển động: Tự động / Bật.
- Lưu trên trình duyệt (`localStorage`), áp dụng ngay, không cần tải lại. Chưa lưu trên tài khoản.

Tiêu chí:

- [x] Tải trang không bị chớp sáng rồi mới tối (script chạy trước khi trang vẽ)
- [x] Chọn tùy chọn không đóng menu; dùng được bằng bàn phím
- [x] "Tự động" đổi theo thiết bị ngay khi thiết bị đổi chế độ tối
- [x] Dữ liệu lưu bị hỏng thì về mặc định, không lỗi trang

## 2. Bài viết

### 2.1 Danh sách bài 🌐📱

- Trang chủ: bài mới nhất đã đăng, 10 bài/trang. Có tab "Mới" và "Nhiều người đọc".
- Mỗi bài hiện: ảnh đại diện và tên người đăng, thời gian cụ thể ("14:05, 4 tháng 11"), danh mục, tiêu đề, tóm tắt, tag, số thích, nút Thích, nút Chia sẻ, số bình luận, và **2 bình luận công khai mới nhất**. Bấm vào bài thì xem đủ bình luận.

Tiêu chí:

- [x] Web có thanh phân trang, URL giữ số trang (`?page=3`)
- [ ] App cuộn vô hạn, kéo xuống để làm mới
- [ ] Trang trống có lời nhắn thân thiện (xem `giong-van-va-giao-dien.md`)

### 2.2 Chi tiết bài 🌐📱

- Hiển thị Markdown đã lọc an toàn, mục lục tự động nếu bài dài.
- Đếm lượt xem (mỗi người/phiên tính một lần là đủ).

Tiêu chí:

- [x] Không chạy được script chèn trong Markdown (web: `frontend/web/src/lib/markdown.test.ts`)
- [x] Web có thẻ meta, Open Graph để chia sẻ link đẹp
- [x] Bài chưa đăng trả 404 với người không phải tác giả/admin

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

### 2.6 Thích và chia sẻ 🌐📱

- Hàng xóm đã đăng nhập bấm Thích / Bỏ thích bài đã đăng; ai cũng thấy số thích.
- Chia sẻ: điện thoại mở bảng chia sẻ của hệ điều hành; máy tính sao chép liên kết bài, báo "Đã sao chép liên kết".

Tiêu chí:

- [ ] Mỗi người thích một bài một lần; bấm liên tục không làm sai số
- [ ] Chưa đăng nhập bấm Thích thì chuyển tới đăng nhập rồi quay lại bài
- [ ] Nút Thích có `aria-pressed`, không chỉ đổi màu

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

## 5. Tin nhắn riêng 🌐📱

- Trang `/tin-nhan`: danh sách cuộc trò chuyện (người, tin cuối, số tin chưa đọc), khung chat.
- Gửi chữ, ảnh (JPG/PNG/WebP tối đa 5 MB), video (MP4/WebM tối đa 25 MB), tối đa 4 file mỗi tin.
- Tin hiện ra ngay, có "đã xem", "đang gõ" ([ADR 0006](quyet-dinh/0006-chat-thoi-gian-thuc-bang-socket-io.md)).
- Bạn bè nhắn thẳng vào hộp chính. Người chưa kết bạn nhắn thì tin vào hộp **Tin nhắn chờ** của người nhận; người nhận chấp nhận thì cuộc trò chuyện sang hộp chính, từ chối thì bên gửi không nhắn tiếp được.
- Chặn người dùng: không nhận tin, không nhận lời mời kết bạn từ người đó.

Tiêu chí:

- [ ] Chỉ hai người trong cuộc trò chuyện đọc được tin và mở được file đính kèm (người khác, kể cả trưởng xóm, nhận 404)
- [ ] File sai loại hoặc quá giới hạn bị từ chối ở cả trình duyệt lẫn backend
- [ ] Mất mạng rồi có lại thì tải bù tin bị lỡ
- [ ] Gửi liên tục bị giới hạn tần suất
- [ ] Nội dung tin hiển thị dạng chữ thường (không render HTML)

## 6. Thông báo 🌐📱

- Nút chuông ở header, cạnh nút Tin nhắn và ảnh đại diện; có số thông báo chưa đọc.
- Có thông báo khi: ai đó bình luận bài của mình, trả lời bình luận của mình, thích bài của mình, gửi hoặc chấp nhận lời mời kết bạn; bài được duyệt hoặc bị từ chối.
- Bấm một thông báo thì đánh dấu đã đọc và mở chỗ liên quan; có "Đánh dấu tất cả đã đọc".

Tiêu chí:

- [x] Web: nút Thông báo và nút Tin nhắn ở header (giao diện, chưa có dữ liệu)
- [ ] Số chưa đọc đúng, cập nhật ngay khi có thông báo mới (qua Socket.IO, ADR 0006)
- [ ] Không tạo thông báo cho chính hành động của mình (tự thích bài mình)
- [ ] Thông báo của bài, bình luận đã bị xóa hay ẩn không còn hiện

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

- Tải ảnh lên cho bài (ảnh bìa bài, ảnh trong bài). Ảnh đại diện, ảnh bìa hồ sơ, file trong tin nhắn đã có ở mục 1.4 và 5
- Lưu bài
- Nhóm chat nhiều người
- Báo cáo vi phạm
- Chế độ tối cho app
- Deploy (web lên Vercel hoặc VPS, MySQL trên dịch vụ cloud, app build bằng EAS)
