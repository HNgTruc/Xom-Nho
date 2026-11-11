# Lộ trình

Làm theo thứ tự. Mỗi giai đoạn kết thúc bằng một thứ chạy được. Đánh `[x]` khi xong.

Gõ `/tiep-theo` trong Claude Code để được gợi ý việc kế tiếp.

## Giai đoạn 0: Khung project

- [x] Tài liệu thiết kế, `CLAUDE.md`, cấu hình `.claude/`
- [x] Cây thư mục `backend/`, `frontend/`, `frontend/ui/`, `api/`
- [x] `database/docker-compose.yml` cho MySQL + Adminer
- [x] `pnpm db:up` chạy được, vào được Adminer
- [x] `api`: package.json, tsconfig, `src/index.ts`
- [x] `ui`: package.json, `tokens/`, `styles/theme.css`, shadcn init, vài component đầu tiên
- [x] `backend`: `nest new`, cổng 4000, endpoint `GET /api/v1/health`
- [x] `frontend/web`: `create-next-app`, import theme từ `ui`
- [x] `frontend/admin`: Vite React TS, Tailwind, React Router, import theme từ `ui`
- [x] `frontend/mobile-app`: `create-expo-app`, `src/theme` đọc token từ `ui`
- [x] Mỗi package có script `dev`, `build`, `lint`, `typecheck`, `test` để `turbo` chạy được (`ui` không có `dev`/`build` vì xuất thẳng TS; mobile không có `build`, build app bằng EAS ở giai đoạn 7)
- [x] `pnpm dev` chạy được cả 4, mỗi frontend gọi được `/api/v1/health`
- [x] GitHub Actions: lint + typecheck + test mỗi lần push
- [x] Kiểm tra app trên điện thoại thật bằng Expo Go (iPhone hiện "Đã kết nối backend")
- [x] Commit đầu tiên lên GitHub

**Xong khi:** clone repo về máy khác, làm theo README là thấy cả 4 phần chạy và nói chuyện được với backend.

## Giai đoạn 1: Nền móng backend

- [x] `config/`: đọc và kiểm tra biến môi trường bằng Zod
- [x] `common/`: `ZodValidationPipe`, `AppException` + filter, response interceptor, `@Public`, `@CurrentUser`, `@Roles`
- [x] `infrastructure/database`: Prisma kết nối MySQL Docker
- [x] Schema Prisma theo `co-so-du-lieu.md`, migration đầu tiên
- [x] `api`: `slugify`, `removeVietnameseTones`, `Result`, hằng số vai trò/trạng thái/mã lỗi, có test
- [x] Seed dữ liệu mẫu
- [x] `api/api-client`: `createClient`, `ApiError`

**Xong khi:** mở Adminer thấy đủ bảng và dữ liệu mẫu; `GET /api/v1/categories` trả đúng định dạng.

## Giai đoạn 2: Đăng nhập

- [x] Better Auth trong backend (`infrastructure/auth`), sinh bảng auth, migration
- [x] `AuthGuard` toàn cục, `RolesGuard`, plugin admin (vai trò `user`, `author`, `admin`)
- [x] CORS + `trustedOrigins` cho web và admin
- [x] `modules/auth`: `GET /me`, `PATCH /me`
- [x] Web: đăng ký, đăng nhập email, chuyển tiếp cookie trong Server Components
- [x] Admin: trang đăng nhập, chặn người không phải admin
- [x] Mobile: plugin Expo, đăng nhập email, nhớ phiên
- [x] Google + GitHub trên web (đã thử với khóa thật)

**Xong khi:** cùng một tài khoản đăng nhập được ở cả 3 frontend; tài khoản thường không vào được admin.

## Giai đoạn 3: Đọc bài

- [x] Backend: `posts` (danh sách, chi tiết), `categories`, `tags`, `users` (hồ sơ), `search`
- [x] Test service + policy cho từng vai trò
- [x] Web: trang chủ có phân trang, chi tiết bài (Markdown an toàn), danh mục, tag, hồ sơ, tìm kiếm (ô tìm ở header, trang `/tim-kiem`)
- [ ] Web: metadata, Open Graph (không làm sitemap: khách không đọc được bài, ADR 0007)
- [x] Chỉ thành viên đọc được: backend bỏ `@Public()` ở route đọc, web có `proxy.ts` và trang chào mừng cho khách (ADR 0007)
- [x] Web: giao diện kính trên ảnh nền, header viên thuốc, chuyển động (MASTER 2.4, 5)
- [x] Web: menu người dùng (Hồ sơ, Cài đặt, Hiển thị và trợ năng, Đăng xuất)

## Giai đoạn 4: Viết bài + bình luận

- [x] Backend: tạo bài kèm ảnh/video, đăng thẳng (ADR 0008), giới hạn tần suất trong bộ nhớ (`infrastructure/rate-limit`)
- [x] Web: tấm tạo bài ở trang chủ, hộp soạn tải ảnh/video, lưới ảnh trên thẻ bài, ảnh/video ở trang bài
- [ ] Backend: sửa/xóa bài (xóa cả file trên đĩa), `comments`
- [ ] Dọn file tải lên mà không gắn bài quá 1 ngày
- [ ] Backend: `PostLike` (thích / bỏ thích), feed trả số thích và 2 bình luận công khai mới nhất
- [ ] Web: trình soạn Markdown có xem trước, bài của tôi, bình luận + trả lời
- [ ] Web: thẻ bài có người đăng, thời gian cụ thể, Thích, Chia sẻ, 2 bình luận mới nhất
- [ ] Test Playwright: đăng ký → viết bài → bình luận

## Giai đoạn 4b: Hồ sơ, cài đặt, kết bạn

- [x] `infrastructure/storage` + module `files`: tải ảnh, video, kiểm tra chữ ký nhị phân, giới hạn 5 MB / 25 MB ([ADR 0005](quyet-dinh/0005-luu-file-tren-o-dia-backend.md)); làm sớm ở giai đoạn 4 cho bài viết
- [ ] Migration: `user.coverImage`, `user.location`, bảng `Friendship`, `UserBlock`
- [ ] Backend: `modules/friends` (mời, chấp nhận, từ chối, hủy), hồ sơ trả số bạn bè và quan hệ với người xem
- [ ] Web: trang hồ sơ có ảnh bìa, ảnh đại diện, nơi ở, số bạn bè, bài viết, ô viết bài
- [ ] Web: trang cài đặt, trang bạn bè
- [ ] Test phân quyền cho từng vai trò, người bị cấm

**Xong khi:** hai tài khoản kết bạn được với nhau, đổi được ảnh đại diện và ảnh bìa.

## Giai đoạn 4c: Tin nhắn riêng

- [ ] Migration: `Conversation`, `ConversationMember`, `Message`, `MessageAttachment`
- [ ] Backend: `modules/messages` (REST), gateway Socket.IO ([ADR 0006](quyet-dinh/0006-chat-thoi-gian-thuc-bang-socket-io.md)), hộp Tin nhắn chờ cho người lạ
- [ ] Web: trang `/tin-nhan`, gửi ảnh và video (5 MB / 25 MB), đã xem, đang gõ, số tin chưa đọc
- [ ] Test: người ngoài cuộc trò chuyện không đọc được tin, không mở được file
- [x] Web: nút Tin nhắn, Thông báo ở header (giao diện, chưa có dữ liệu)
- [ ] Backend: `modules/notifications` (bảng `Notification`, tạo khi bình luận, thích, kết bạn, duyệt bài), đẩy qua Socket.IO
- [ ] Web: bảng Thông báo, bảng Tin nhắn có dữ liệu thật, số chưa đọc

**Xong khi:** hai tài khoản trên hai trình duyệt nhắn cho nhau, tin hiện ngay, gửi được ảnh và video.

## Giai đoạn 5: Trang quản trị

- [ ] Backend: các `*.admin.controller.ts` theo `api.md`, `modules/dashboard`
- [ ] Admin: layout (sidebar, topbar), `DataTable` dùng chung
- [ ] Tổng quan số liệu
- [ ] Hàng chờ duyệt bài
- [ ] Quản lý bài, bình luận
- [ ] Danh mục, tag
- [ ] Thành viên: đổi vai trò, cấm

## Giai đoạn 6: Mobile app

- [ ] Tab: Trang chủ, Tìm kiếm, Viết, Cá nhân
- [ ] Danh sách bài cuộn vô hạn, kéo để làm mới
- [ ] Chi tiết bài, bình luận, trả lời
- [ ] Viết bài, xem trước
- [ ] Hồ sơ, bài của tôi

## Giai đoạn 7: Hoàn thiện

- [ ] Rà soát bảo mật (agent `kiem-tra-bao-mat`), có WebSocket và tải file
- [ ] Deploy: ổ đĩa lưu lâu dài cho `media/` và sao lưu; nhiều bản backend thì chuyển file lên cloud và thêm adapter Redis cho Socket.IO
- [ ] Rà soát hiệu năng (agent `kiem-tra-hieu-nang`)
- [ ] Ảnh chụp màn hình, GIF demo trong README
- [ ] Deploy: backend + MySQL, web, admin (tên miền con riêng). MySQL cần `innodb_ft_min_token_size=1` và `innodb_ft_enable_stopword=OFF` (xem `co-so-du-lieu.md`, mục Tìm kiếm tiếng Việt)
- [ ] Thử đăng nhập Google/GitHub trên app (cần backend có địa chỉ công khai; code và test e2e đã có từ giai đoạn 2, xem `thiet-lap-moi-truong.md` mục 6)
- [ ] Build app bằng EAS (tùy chọn)
