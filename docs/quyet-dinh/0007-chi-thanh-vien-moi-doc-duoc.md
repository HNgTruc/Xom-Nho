# 0007. Chỉ thành viên mới đọc được, khách chỉ thấy trang chào mừng

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-11

## Bối cảnh

Trước đây khách (chưa đăng nhập) đọc được bài đã đăng, danh mục, thẻ, hồ sơ, tìm kiếm; header hiện cả thanh danh mục. Chủ dự án muốn Xóm Nhỏ là chỗ **riêng của người trong xóm**: đăng xuất ra thì không còn thấy các tab hay nội dung, chỉ còn lời chào và nút Đăng nhập, Đăng ký. Hướng này cũng hợp với các tính năng sắp làm (kết bạn, tin nhắn riêng, hồ sơ có thông tin cá nhân).

## Quyết định

Khách chỉ mở được **trang chào mừng, đăng nhập, đăng ký**. Mọi thứ khác cần đăng nhập.

- **Backend (chỗ chặn thật):** bỏ `@Public()` ở tất cả route đọc dữ liệu: `GET /posts`, `GET /posts/:slug`, `POST /posts/:id/view`, `GET /categories`, `GET /tags`, `GET /tags/:slug`, `GET /users/:username`, `GET /search`. Khách nhận 401, người bị cấm nhận 403 (trước đây người bị cấm vẫn đọc được như khách). Chỉ còn mở `GET /health` và `GET /auth/providers` (trang đăng nhập cần biết đang bật Google, GitHub hay không). Route thêm sau mặc định cũng cần đăng nhập (AuthGuard toàn cục).
- **Web:** `src/proxy.ts` (Next 16, trước gọi là middleware) xem có cookie phiên Better Auth không, **không gọi backend**:
  - khách mở `/`: hiện trang chào mừng `/chao-mung` ngay tại `/` (rewrite, URL giữ nguyên);
  - khách mở trang khác: sang `/dang-nhap?next=<trang đó>`, đăng nhập xong quay lại đúng trang;
  - danh sách trang khách mở được nằm ở `features/auth/lib/guest-access.ts`; trang thêm sau tự động cần đăng nhập.
  - Cookie còn mà phiên đã hết hạn hay bị khóa thì proxy cho qua, nhưng trang tự kiểm tra lại bằng `requireUser(next)` rồi chuyển sang đăng nhập.
- Header của khách chỉ có logo, Đăng nhập, Đăng ký (`SiteShell guest`); trang chào mừng không đọc cookie nên dựng sẵn lúc build.
- Web bỏ `publicApi` (client không gửi cookie): mọi lần đọc dữ liệu đều chuyển tiếp cookie.

Phương án đã cân nhắc:

- **Chỉ ẩn ở web, backend vẫn mở:** nhanh, nhưng ai gọi thẳng API vẫn đọc được hết. Trái quy tắc "quyền kiểm tra ở backend".
- **Kiểm tra phiên trong từng trang, không có proxy:** trang chủ của khách phải chờ backend trả lời mới biết hiện chào mừng hay feed (khung xương nhấp nháy rồi mới đổi). Proxy chỉ đọc cookie nên quyết định ngay, trang chào mừng là trang tĩnh.
- **Cho khách xem một phần (danh sách bài, không xem chi tiết):** chủ dự án chọn chỉ có trang chào mừng.

## Hệ quả

- **Mất SEO và link chia sẻ đẹp:** Google không lập chỉ mục được bài nào. Link bài gửi qua Facebook, Zalo chỉ hiện trang đăng nhập "Xóm Nhỏ", không có tiêu đề hay ảnh của bài. Thẻ Open Graph của bài vẫn còn trong code nhưng chỉ người đã đăng nhập thấy; sitemap bỏ khỏi lộ trình.
- **Đổi hành vi `/api/v1`** (siết quyền là thay đổi phá client cũ). Làm được vì chưa có client nào phát hành dựa vào quyền đọc của khách: app điện thoại chưa có màn đọc bài. Sau khi phát hành app, thay đổi kiểu này phải qua `/api/v2`.
- App điện thoại (giai đoạn 6) cũng bắt đăng nhập trước khi đọc.
- `PostsPolicy.canView` vẫn nhận `user` rỗng (test cho khách giữ nguyên), nhưng controller luôn truyền người đang đăng nhập.
- Test e2e: route đọc gọi bằng phiên của một hàng xóm (`test/fixtures/session.ts`); `guest-access.e2e-spec.ts` kiểm tra khách nhận 401, người bị cấm nhận 403 ở từng route.
- Muốn mở lại cho khách sau này: thêm `@Public()` ở backend, thêm đường dẫn vào `guest-access.ts`, viết ADR mới thay thế ADR này.
