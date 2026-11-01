# CLAUDE.md: Xóm Nhỏ

Xóm Nhỏ là diễn đàn / blog cộng đồng tiếng Việt. Một **backend** NestJS và ba **frontend**: web (Next.js), admin (React + Vite), mobile-app (Expo). Project cá nhân, để trên GitHub.

## Bối cảnh nhanh

- Người dùng gọi là **hàng xóm**. Vai trò: `user` (hàng xóm), `author` (cây bút), `admin` (trưởng xóm). Chi tiết: `docs/phan-quyen.md`.
- Bài của `user` phải chờ duyệt; bài của `author` đăng thẳng; `admin` duyệt bài, ẩn bình luận, quản lý thành viên **trên app admin riêng**.
- Trước khi làm một tính năng: đọc mục tương ứng trong `docs/tinh-nang.md`, xem `docs/lo-trinh.md` đang ở giai đoạn nào.

## Cấu trúc

```
backend/               NestJS: API /api/v1, Better Auth, Prisma, MySQL. Nơi DUY NHẤT có quy tắc nghiệp vụ và chạm DB
frontend/web/          Next.js: trang cho khách, hàng xóm, cây bút
frontend/admin/        React + Vite: trang quản trị cho trưởng xóm
frontend/mobile-app/   Expo: app điện thoại, như web trừ quản trị
ui/                    Design system: token (cả 3 frontend) + component shadcn/ui (web, admin)
shared/                Zod schema, kiểu API, hằng số, tiện ích, API client có kiểu
docs/                  Tài liệu thiết kế
docker/                Cấu hình MySQL
```

Mỗi phần có `CLAUDE.md` riêng, đọc khi làm việc trong thư mục đó. Sơ đồ đầy đủ và lý do: `docs/kien-truc.md`.

**Phụ thuộc chỉ đi một chiều:** `frontend/* → ui, shared`; `backend → shared`. `ui` và `shared` không import backend/frontend. Các frontend không import lẫn nhau.

## Công nghệ

- pnpm workspaces + Turborepo, TypeScript strict
- Backend: NestJS, Prisma, MySQL 8.4 (Docker, cổng máy **3307**), Better Auth (email/mật khẩu, Google, GitHub; plugin admin, plugin Expo)
- Web: Next.js App Router, Tailwind CSS v4
- Admin: React + Vite, React Router, TanStack Query, TanStack Table
- Mobile: Expo + Expo Router, chạy thử bằng Expo Go trên điện thoại thật
- UI: shadcn/ui (Radix + Tailwind), font Be Vietnam Pro
- Kiểm tra dữ liệu: Zod ở `shared`, dùng chung cho backend và frontend
- Test: Vitest / Jest (theo mặc định của từng framework), Playwright cho web

Phiên bản xem `package.json` của từng phần. **NestJS, Next.js, Expo, Prisma, Better Auth đổi API thường xuyên**: đọc tài liệu theo đúng bản đã cài trước khi viết code dùng chúng, không dựa vào trí nhớ.

## Lệnh

```bash
docker compose up -d                  # MySQL :3307 + Adminer :8080
pnpm install
pnpm dev                              # chạy tất cả (turbo)
pnpm dev:web | dev:admin | dev:mobile # backend + một frontend
pnpm --filter backend dev             # API http://localhost:4000
pnpm --filter web dev                 # http://localhost:3000
pnpm --filter admin dev               # http://localhost:5173
pnpm --filter mobile-app start        # quét QR bằng Expo Go
pnpm lint && pnpm typecheck && pnpm test
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
```

Script được thêm khi khởi tạo từng phần (giai đoạn 0). Script chưa có thì đề xuất thêm vào `package.json`.

## Quy ước chung

- Chia code **theo tính năng**: `backend/src/modules/<tính-năng>/`, `frontend/*/src/features/<tính-năng>/`. Thư mục định tuyến (`app/`, `router.tsx`) chỉ ghép feature lại.
- Tên file kebab-case; component React PascalCase; hàm, biến camelCase; model Prisma PascalCase số ít.
- Code, tên biến, commit: **tiếng Anh**. Chữ hiển thị, comment nghiệp vụ, tài liệu: **tiếng Việt**.
- Dữ liệu vào backend luôn qua schema Zod trong `shared`. Frontend dùng cùng schema cho form.
- Frontend gọi backend **chỉ qua `@xom-nho/shared/api-client`**.
- Quyền kiểm tra **ở backend**. Frontend ẩn/hiện nút chỉ để tiện.
- Component nền (nút, ô nhập, hộp thoại) lấy từ `@xom-nho/ui`, không sao chép vào từng app.
- Không thêm thư viện mới khi chưa hỏi.
- Conventional Commits, scope là tên phần: `feat(backend): ...`, `fix(admin): ...`.

## Không được làm

- Không sửa `.env*` (trừ `.env.example`), không in bí mật ra màn hình.
- Không sửa migration Prisma đã commit; đổi schema thì tạo migration mới.
- Không chạy `docker compose down -v` hay `prisma migrate reset` khi chưa hỏi.
- Không gọi database hay viết quy tắc nghiệp vụ trong frontend.
- Không `dangerouslySetInnerHTML` với nội dung người dùng.

## Tài liệu

| File                             | Nội dung                                                 |
| -------------------------------- | -------------------------------------------------------- |
| `docs/kien-truc.md`              | Sơ đồ hệ thống, cây thư mục, tầng trong backend/frontend |
| `docs/co-so-du-lieu.md`          | Bảng, quan hệ, chỉ mục, tìm kiếm tiếng Việt              |
| `docs/api.md`                    | Endpoint `/api/v1` và `/api/v1/admin`                    |
| `docs/phan-quyen.md`             | Ma trận quyền                                            |
| `docs/tinh-nang.md`              | Tính năng và tiêu chí hoàn thành                         |
| `docs/giong-van-va-giao-dien.md` | Giọng văn, màu, chữ                                      |
| `docs/thiet-lap-moi-truong.md`   | Cài đặt trên Windows, Docker, Expo Go                    |
| `docs/lo-trinh.md`               | Các giai đoạn                                            |
| `docs/quyet-dinh/`               | Quyết định kỹ thuật (ADR)                                |

## Công cụ Claude trong repo

- Rules (`.claude/rules/`): tự nạp theo thư mục đang sửa.
- Skills: `tao-tinh-nang`, `tao-module-backend`, `prisma-migration`, `trang-admin-crud`, `man-hinh-mobile`, `them-component-ui`.
- Agents: `kiem-tra-bao-mat`, `review-code`, `kiem-tra-hieu-nang`, `viet-test`.
- Commands: `/tiep-theo`, `/review`, `/db-reset`, `/fix-issue <số>`, `/commit`.
- Hooks: tự format sau khi sửa; chặn sửa `.env`, lockfile, migration đã commit.

Xong một việc trong `docs/lo-trinh.md` thì đánh dấu `[x]`.
