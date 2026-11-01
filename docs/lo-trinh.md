# Lộ trình

Làm theo thứ tự. Mỗi giai đoạn kết thúc bằng một thứ chạy được. Đánh `[x]` khi xong.

Gõ `/tiep-theo` trong Claude Code để được gợi ý việc kế tiếp.

## Giai đoạn 0: Khung project

- [x] Tài liệu thiết kế, `CLAUDE.md`, cấu hình `.claude/`
- [x] Cây thư mục `backend/`, `frontend/`, `ui/`, `shared/`
- [x] `docker-compose.yml` cho MySQL + Adminer
- [ ] `docker compose up -d` chạy được, vào được Adminer
- [ ] `shared`: package.json, tsconfig, `src/index.ts`
- [ ] `ui`: package.json, `tokens/`, `styles/theme.css`, shadcn init, vài component đầu tiên
- [ ] `backend`: `nest new`, cổng 4000, endpoint `GET /api/v1/health`
- [ ] `frontend/web`: `create-next-app`, import theme từ `ui`
- [ ] `frontend/admin`: Vite React TS, Tailwind, React Router, import theme từ `ui`
- [ ] `frontend/mobile-app`: `create-expo-app`, `src/theme` đọc token từ `ui`
- [ ] Mỗi package có script `dev`, `build`, `lint`, `typecheck`, `test` để `turbo` chạy được
- [ ] `pnpm dev` chạy được cả 4, mỗi frontend gọi được `/api/v1/health`
- [ ] GitHub Actions: lint + typecheck + test mỗi lần push
- [ ] Commit đầu tiên lên GitHub

**Xong khi:** clone repo về máy khác, làm theo README là thấy cả 4 phần chạy và nói chuyện được với backend.

## Giai đoạn 1: Nền móng backend

- [ ] `config/`: đọc và kiểm tra biến môi trường bằng Zod
- [ ] `common/`: `ZodValidationPipe`, `AppException` + filter, response interceptor, `@Public`, `@CurrentUser`, `@Roles`
- [ ] `infrastructure/database`: Prisma kết nối MySQL Docker
- [ ] Schema Prisma theo `co-so-du-lieu.md`, migration đầu tiên
- [ ] `shared`: `slugify`, `removeVietnameseTones`, `Result`, hằng số vai trò/trạng thái/mã lỗi, có test
- [ ] Seed dữ liệu mẫu
- [ ] `shared/api-client`: `createClient`, `ApiError`

**Xong khi:** mở Adminer thấy đủ bảng và dữ liệu mẫu; `GET /api/v1/categories` trả đúng định dạng.

## Giai đoạn 2: Đăng nhập

- [ ] Better Auth trong backend (`infrastructure/auth`), sinh bảng auth, migration
- [ ] `AuthGuard` toàn cục, `RolesGuard`, plugin admin (vai trò `user`, `author`, `admin`)
- [ ] CORS + `trustedOrigins` cho web và admin
- [ ] `modules/auth`: `GET /me`, `PATCH /me`
- [ ] Web: đăng ký, đăng nhập email, chuyển tiếp cookie trong Server Components
- [ ] Admin: trang đăng nhập, chặn người không phải admin
- [ ] Mobile: plugin Expo, đăng nhập email, nhớ phiên
- [ ] Google + GitHub trên web, rồi trên mobile

**Xong khi:** cùng một tài khoản đăng nhập được ở cả 3 frontend; tài khoản thường không vào được admin.

## Giai đoạn 3: Đọc bài

- [ ] Backend: `posts` (danh sách, chi tiết), `categories`, `tags`, `users` (hồ sơ), `search`
- [ ] Test service + policy cho từng vai trò
- [ ] Web: trang chủ có phân trang, chi tiết bài (Markdown an toàn), danh mục, tag, hồ sơ, tìm kiếm
- [ ] Web: metadata, Open Graph, sitemap

## Giai đoạn 4: Viết bài + bình luận

- [ ] Backend: tạo/sửa/xóa bài, luồng trạng thái, `comments`, giới hạn tần suất
- [ ] Web: trình soạn Markdown có xem trước, bài của tôi, bình luận + trả lời
- [ ] Test Playwright: đăng ký → viết bài → bình luận

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

- [ ] Rà soát bảo mật (agent `kiem-tra-bao-mat`)
- [ ] Rà soát hiệu năng (agent `kiem-tra-hieu-nang`)
- [ ] Ảnh chụp màn hình, GIF demo trong README
- [ ] Deploy: backend + MySQL, web, admin (tên miền con riêng)
- [ ] Build app bằng EAS (tùy chọn)
