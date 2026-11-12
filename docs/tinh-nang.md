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

- [ ] File sai loại (đổi đuôi .exe thành .jpg) bị từ chối, có lời báo tiếng Việt (ảnh đại diện: xong 2026-11-12; ảnh bìa: chưa)
- [ ] File quá 5 MB bị chặn ngay ở trình duyệt, backend cũng chặn (ảnh đại diện: xong 2026-11-12; ảnh bìa: chưa)
- [ ] Đổi ảnh thì file cũ bị xóa khỏi ổ đĩa (ảnh đại diện: xong 2026-11-12; ảnh bìa: chưa)

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

### 2.0 Trang chào mừng cho khách 🌐📱

Xóm Nhỏ chỉ dành cho người trong xóm (ADR 0007). Khách (chưa đăng nhập, hoặc vừa đăng xuất) chỉ thấy trang chào mừng: tên Xóm Nhỏ, vài câu giới thiệu, nút **Tham gia xóm** (đăng ký) và **Đăng nhập**, ba tấm nhỏ nói trong xóm có gì. Header chỉ có logo, Đăng nhập, Đăng ký; không có thanh danh mục, Tin nhắn, Thông báo.

Tiêu chí:

- [x] Web: khách mở `/` thấy trang chào mừng (URL giữ `/`); đã đăng nhập thì thấy feed
- [x] Web: khách mở bài, danh mục, thẻ, hồ sơ, cài đặt (hay trang bất kỳ khác) thì sang đăng nhập, xong quay lại đúng trang
- [x] Backend: mọi route đọc dữ liệu trả 401 cho khách, 403 cho người bị cấm (`test/e2e/guest-access.e2e-spec.ts`)
- [x] Phiên hết hạn mà cookie còn: trang tự chuyển sang đăng nhập, không hiện lỗi
- [ ] App: chưa đăng nhập thì vào màn chào mừng, không vào được màn đọc bài

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
- [x] Web có thẻ meta, Open Graph (chỉ người đã đăng nhập thấy: link chia sẻ cho người ngoài chỉ hiện trang đăng nhập, ADR 0007)
- [x] Bài chưa đăng trả 404 với người không phải tác giả/admin

### 2.3 Viết và sửa bài 🌐📱

Soạn kiểu mạng xã hội (ADR 0008). Đầu trang chủ là tấm **tạo bài**: ảnh đại diện, ô "Chào {tên}, hôm nay có chuyện gì?", nút Ảnh/Video. Bấm vào mở hộp soạn:

- Tiêu đề (không bắt buộc), nội dung chữ thường (giữ xuống dòng), danh mục (bắt buộc, mặc định danh mục đầu).
- Ảnh JPG/PNG/WebP đến 5 MB, video MP4/WebM đến 25 MB, tối đa 10 file. Chọn xong là tải lên ngay, mỗi file một ô xem trước có trạng thái (đang tải, lỗi) và nút gỡ.
- Phải có chữ hoặc ít nhất một ảnh/video. Mọi thành viên đăng thẳng; đăng xong feed tự làm mới, bài lên đầu.
- Tóm tắt tự lấy 160 ký tự đầu; slug từ tiêu đề hoặc vài từ đầu nội dung.

Tiêu chí:

- [x] Web: tấm tạo bài ở trang chủ, hộp soạn có ảnh/video, đăng thẳng (`files-and-create-post.e2e-spec.ts`)
- [x] File sai loại (đổi đuôi), quá cỡ bị từ chối ở cả trình duyệt lẫn backend (chữ ký nhị phân)
- [x] Không dùng được ảnh của người khác hay ảnh đã gắn bài khác
- [x] Thoát giữa chừng có hỏi lại, không mất bài
- [x] Thẻ bài hiện lưới ảnh/video (tối đa 4 ô, ô cuối "+N"); trang bài hiện đủ ảnh và video có điều khiển, tua được
- [ ] Sửa, xóa bài của mình
- [ ] App: màn tạo bài, chọn ảnh/video từ máy
- [ ] Dọn file đã tải lên mà không gắn bài

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

- Ô tìm ở thanh trên (web, chỉ thành viên) và tab Tìm kiếm (app). Web: từ 1024px ô luôn hiện giữa thanh danh mục và nút Tin nhắn; nhỏ hơn là nút kính lúp, bấm vào ô tìm phủ ngang hàng trên của header. Phím `/` đưa con trỏ vào ô.
- Enter thì sang `/tim-kiem?q=`: từ khóa, số bài, lọc theo danh mục, kết quả như feed.
- Gõ có dấu hay không dấu đều ra kết quả. Lọc thêm theo danh mục.

Tiêu chí:

- [x] "ban tron" tìm ra bài có chữ "bàn tròn" (backend: `public-read.e2e-spec.ts`)
- [x] "do an" tìm ra "đồ ăn"
- [x] Từ khóa rỗng không gọi truy vấn (api-client trả trang rỗng; web chỉ nhắc gõ từ khóa)
- [x] Có phân trang (web: `?page=`, giữ từ khóa và danh mục)
- [x] Không tìm ra thì hiện câu mẫu "Tìm không ra"
- [ ] App: tab Tìm kiếm

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
