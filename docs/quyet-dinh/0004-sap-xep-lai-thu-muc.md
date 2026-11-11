# 0004. Sắp xếp lại thư mục thành bốn khối

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-11

## Bối cảnh

Sau [0002](0002-tach-backend-va-admin.md), gốc repo có 8 thư mục (`backend/`, `frontend/`, `ui/`, `shared/`, `docker/`, `design-system/`, `docs/`) và 16 file lẻ. Nhìn vào khó biết thứ gì thuộc phần nào, file cấu hình nằm rải ở gốc.

## Quyết định

Gom về bốn khối chính, mỗi khối một thư mục:

| Trước                                  | Sau                                   |
| -------------------------------------- | ------------------------------------- |
| `backend/`                             | `backend/` (giữ nguyên)               |
| `shared/` (`@xom-nho/shared`)          | `api/` (`@xom-nho/api`)               |
| `ui/`                                  | `frontend/ui/` (vẫn là `@xom-nho/ui`) |
| `docker/`, `docker-compose.yml`        | `database/`                           |
| `backend/prisma/` (schema, migrations) | `database/prisma/`                    |
| `backend/prisma/seed.ts`               | `backend/scripts/seed.ts`             |
| `design-system/`                       | `docs/design-system/`                 |
| `tsconfig.base.json`                   | `config/tsconfig.base.json`           |
| `.prettierrc.json`, `.prettierignore`  | khóa `prettier` trong `package.json`  |
| `CLAUDE.local.md.example`              | `.claude/CLAUDE.local.md.example`     |
| `CLAUDE.md` (gốc)                      | `.claude/CLAUDE.md`                   |

Chi tiết:

- **Prisma CLI vẫn chạy từ `backend`** (`pnpm --filter backend db:migrate`...). `backend/prisma.config.ts` trỏ tới `../database/prisma`; client sinh ra vẫn ở `backend/src/generated/prisma`.
- **`seed.ts` ở lại backend** vì nó dùng code nghiệp vụ của backend (`buildPostSearchText`, `loadEnv`, Prisma client) và các gói cài trong `backend/node_modules`; đặt ngoài backend thì Node không tìm được các gói đó.
- **Docker Compose chạy qua script ở gốc**: `pnpm db:up`, `pnpm db:down`, `pnpm db:ps`, `pnpm db:compose <lệnh>`. Script truyền `--env-file .env` vì file compose không còn nằm cạnh `.env`. Tên project compose (`xom-nho`) không đổi nên volume dữ liệu cũ vẫn dùng được.
- **File còn ở gốc** là file công cụ bắt buộc tìm ở gốc: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json`, `.env`, `.env.example`, `.gitignore`, `.gitattributes`, `.editorconfig`, `README.md`. Trong VS Code, các file cấu hình này được gộp dưới `package.json` (file nesting trong `.vscode/settings.json`) nên Explorer chỉ hiện `package.json` và `README.md`.

## Hệ quả

- Gốc repo còn 5 thư mục chính (`backend`, `api`, `frontend`, `database`, `docs`) cộng `config/`.
- Mọi import đổi từ `@xom-nho/shared` sang `@xom-nho/api`.
- Sau khi kéo thay đổi này về phải chạy lại `pnpm install` (đường dẫn workspace đổi).
- Skill ui-ux-pro-max mặc định ghi design system ở `design-system/` tại gốc; nếu chạy lại `--persist` thì phải dời kết quả vào `docs/design-system/`.
