# CLAUDE.md: Xóm Nhỏ

Xóm Nhỏ là diễn đàn / blog cộng đồng tiếng Việt. Một **backend** NestJS và ba **frontend**: web (Next.js), admin (React + Vite), mobile-app (Expo). Project cá nhân, để trên GitHub.

## Bối cảnh nhanh

- Người dùng gọi là **hàng xóm**. Vai trò: `user` (hàng xóm), `author` (cây bút), `admin` (trưởng xóm). Chi tiết: `docs/phan-quyen.md`.
- Bài của `user` phải chờ duyệt; bài của `author` đăng thẳng; `admin` duyệt bài, ẩn bình luận, quản lý thành viên **trên app admin riêng**.
- Trước khi làm một tính năng: đọc mục tương ứng trong `docs/tinh-nang.md`, xem `docs/lo-trinh.md` đang ở giai đoạn nào.

## Cấu trúc

```
backend/               NestJS: API /api/v1, Better Auth, Prisma client, script seed. Nơi DUY NHẤT có quy tắc nghiệp vụ và chạm DB
api/                   Hợp đồng API (@xom-nho/api): Zod schema, kiểu API, hằng số, tiện ích, API client có kiểu
frontend/web/          Next.js: trang cho khách, hàng xóm, cây bút
frontend/admin/        React + Vite: trang quản trị cho trưởng xóm
frontend/mobile-app/   Expo: app điện thoại, như web trừ quản trị
frontend/ui/           Design system (@xom-nho/ui): token (cả 3 frontend) + component shadcn/ui (web, admin)
database/              Dữ liệu: docker-compose.yml (MySQL + Adminer), mysql/init, prisma/ (schema.prisma, migrations)
docs/                  Tài liệu thiết kế; docs/design-system/xom-nho/ là MASTER.md + override cho admin, mobile
config/                Cấu hình dùng chung: tsconfig.base.json
```

Gốc repo chỉ giữ file mà công cụ bắt buộc đặt ở gốc (`package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, `.env*`, `.gitignore`, `.gitattributes`, `.editorconfig`, `README.md`); file này nằm ở `.claude/CLAUDE.md`. VS Code gộp các file cấu hình ở gốc dưới `package.json` (`.vscode/settings.json`). Không thêm file lẻ mới ở gốc; cấu hình Prettier nằm trong `package.json`.

Mỗi phần có `CLAUDE.md` riêng, đọc khi làm việc trong thư mục đó. Sơ đồ đầy đủ và lý do: `docs/kien-truc.md`.

**Phụ thuộc chỉ đi một chiều:** `frontend/* → ui, api`; `backend → api`. `ui` và `api` không import backend/frontend. Các frontend không import lẫn nhau.

## Công nghệ

- pnpm workspaces + Turborepo, TypeScript strict
- Backend: NestJS, Prisma, MySQL 8.4 (Docker, cổng máy **3307**), Better Auth (email/mật khẩu, Google, GitHub; plugin admin, plugin Expo)
- Web: Next.js App Router, Tailwind CSS v4
- Admin: React + Vite, React Router, TanStack Query, TanStack Table
- Mobile: Expo + Expo Router, chạy thử bằng Expo Go trên điện thoại thật
- UI: shadcn/ui (Radix + Tailwind), font Be Vietnam Pro
- Kiểm tra dữ liệu: Zod ở `api`, dùng chung cho backend và frontend
- Test: Vitest / Jest (theo mặc định của từng framework), Playwright cho web

Phiên bản xem `package.json` của từng phần. **NestJS, Next.js, Expo, Prisma, Better Auth đổi API thường xuyên**: đọc tài liệu theo đúng bản đã cài trước khi viết code dùng chúng, không dựa vào trí nhớ.

## Lệnh

```bash
pnpm db:up                            # MySQL :3307 + Adminer :8080 (database/docker-compose.yml)
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

## Nghĩ trước khi làm

- Trước khi sửa: đọc code và tài liệu liên quan (`CLAUDE.md` của phần đó, mục trong `docs/tinh-nang.md`), không sửa dựa trên phỏng đoán.
- Nói ngắn gọn đã hiểu yêu cầu thế nào và định làm gì: sửa file nào, theo cách nào, vì sao.
- Việc lớn (nhiều file, nhiều phần, đổi schema, đổi API, đổi token) thì trình bày kế hoạch và chờ đồng ý rồi mới sửa.
- Yêu cầu chưa rõ thì hỏi, không tự đoán rồi làm.
- Nghĩ trước về ảnh hưởng: phân quyền, dữ liệu đang có, các phần khác dùng chung `api` / `ui`.

## Quy ước chung

- Chia code **theo tính năng**: `backend/src/modules/<tính-năng>/`, `frontend/*/src/features/<tính-năng>/`. Thư mục định tuyến (`app/`, `router.tsx`) chỉ ghép feature lại.
- Tên file kebab-case; component React PascalCase; hàm, biến camelCase; model Prisma PascalCase số ít.
- Code, tên biến, commit: **tiếng Anh**. Chữ hiển thị, comment nghiệp vụ, tài liệu: **tiếng Việt**.
- Dữ liệu vào backend luôn qua schema Zod trong `api`. Frontend dùng cùng schema cho form.
- Frontend gọi backend **chỉ qua `@xom-nho/api/api-client`**.
- Quyền kiểm tra **ở backend**. Frontend ẩn/hiện nút chỉ để tiện.
- Component nền (nút, ô nhập, hộp thoại) lấy từ `@xom-nho/ui`, không sao chép vào từng app.
- Không thêm thư viện mới khi chưa hỏi.
- Conventional Commits, scope là tên phần: `feat(backend): ...`, `fix(admin): ...`.

## Không được làm

- **Không commit.** Trong repo chỉ chủ dự án được commit: Claude không chạy `git commit` (đã chặn trong `.claude/settings.json`), kể cả khi được bảo "commit đi". Làm xong thì báo những file đã đổi và đề xuất cách chia commit kèm message; chủ dự án tự stage và commit.
- Không sửa `.env*` (trừ `.env.example`), không in bí mật ra màn hình.
- Không sửa migration Prisma đã commit; đổi schema thì tạo migration mới.
- Không chạy `pnpm db:compose down -v` (hay `docker compose down -v`) hay `prisma migrate reset` khi chưa hỏi.
- Không gọi database hay viết quy tắc nghiệp vụ trong frontend.
- Không `dangerouslySetInnerHTML` với nội dung người dùng.

## Tài liệu

| File                                   | Nội dung                                                 |
| -------------------------------------- | -------------------------------------------------------- |
| `docs/kien-truc.md`                    | Sơ đồ hệ thống, cây thư mục, tầng trong backend/frontend |
| `docs/co-so-du-lieu.md`                | Bảng, quan hệ, chỉ mục, tìm kiếm tiếng Việt              |
| `docs/api.md`                          | Endpoint `/api/v1` và `/api/v1/admin`                    |
| `docs/phan-quyen.md`                   | Ma trận quyền                                            |
| `docs/tinh-nang.md`                    | Tính năng và tiêu chí hoàn thành                         |
| `docs/giong-van-va-giao-dien.md`       | Giọng văn, câu mẫu                                       |
| `docs/design-system/xom-nho/MASTER.md` | Màu, chữ, khoảng cách, thành phần, checklist giao diện   |
| `docs/thiet-lap-moi-truong.md`         | Cài đặt trên Windows, Docker, Expo Go                    |
| `docs/lo-trinh.md`                     | Các giai đoạn                                            |
| `docs/quyet-dinh/`                     | Quyết định kỹ thuật (ADR)                                |

## Làm giao diện

Mọi việc thay đổi giao diện (trang, màn hình, component, màu, bố cục, chuyển động) ở web, admin, mobile-app, ui:

1. Đọc `docs/design-system/xom-nho/MASTER.md`, rồi file override nếu có (`pages/admin.md` cho admin, `pages/mobile.md` cho mobile-app). Override thắng MASTER.
2. Dùng skill **ui-ux-pro-max** để tra quy tắc cụ thể (`--domain ux`, `--stack nextjs|react|shadcn|react-native`). Không chạy lại `--design-system --persist --force` khi người dùng chưa đồng ý: MASTER đã có quyết định đã kiểm tra.
3. Trước khi xong: chạy checklist ở cuối MASTER (và của file override).
4. Web, admin: mở trang bằng skill **agent-browser** (`http://localhost:3000`, `:5173`), chụp màn hình ở bề rộng điện thoại và máy tính, cả sáng lẫn tối, để tự kiểm tra trước khi báo xong.

Đổi token (màu, chữ, khoảng cách) thì sửa MASTER, `frontend/ui/src/tokens/*` và `frontend/ui/src/styles/theme.css` cùng lúc.

## Công cụ Claude trong repo

- Rules (`.claude/rules/`): tự nạp theo thư mục đang sửa.
- Skills: `tao-tinh-nang`, `tao-module-backend`, `prisma-migration`, `trang-admin-crud`, `man-hinh-mobile`, `them-component-ui`, `agent-browser` (cần cài CLI: `npm i -g agent-browser && agent-browser install`).
- Agents: `kiem-tra-bao-mat`, `review-code`, `kiem-tra-hieu-nang`, `viet-test`.
- Commands: `/tiep-theo`, `/review`, `/db-reset`, `/fix-issue <số>`, `/commit`.
- Hooks: tự format sau khi sửa; chặn sửa `.env`, lockfile, migration đã commit.

Xong một việc trong `docs/lo-trinh.md` thì đánh dấu `[x]`.
