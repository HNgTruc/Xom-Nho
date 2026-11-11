# Thư mục .claude

Cấu hình Claude Code cho Xóm Nhỏ. Mọi thứ ở đây được commit để dùng lại trên máy khác.

| Thư mục / file        | Là gì                                                      | Khi nào chạy                                        |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `CLAUDE.md`           | Hướng dẫn chính: bối cảnh, cấu trúc, lệnh, quy ước         | Mỗi phiên, luôn nạp                                 |
| `../<phần>/CLAUDE.md` | Hướng dẫn riêng của backend, web, admin, mobile-app, ui    | Khi làm việc trong thư mục đó                       |
| `settings.json`       | Quyền (cho phép / hỏi / cấm lệnh) và hooks                 | Luôn áp dụng                                        |
| `rules/`              | Quy tắc theo mảng, `paths` quyết định khi nào nạp          | Tự động theo file đang sửa                          |
| `commands/`           | Lệnh gõ tay                                                | Khi bạn gõ `/ten-lenh`                              |
| `skills/`             | Quy trình nhiều bước, Claude tự chọn dựa vào `description` | Khi việc đang làm khớp mô tả (hoặc gõ `/ten-skill`) |
| `agents/`             | Subagent chuyên biệt, giới hạn công cụ                     | Khi Claude giao việc, hoặc bạn bảo "dùng agent ..." |
| `hooks/`              | Script Node chạy tự động quanh thao tác sửa file           | Trước/sau mỗi lần Claude sửa file                   |

## Rules

| File                | Nạp khi sửa                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `backend-nestjs.md` | `backend/src/**`                                                     |
| `bao-mat.md`        | `backend/src/**`, `frontend/*/src/lib/**`, phần chặn quyền của admin |
| `prisma-mysql.md`   | `database/prisma/**`, `infrastructure/database`, `*.repository.ts`   |
| `frontend-web.md`   | `frontend/web/**`                                                    |
| `frontend-admin.md` | `frontend/admin/**`                                                  |
| `mobile-expo.md`    | `frontend/mobile-app/**`                                             |
| `ui-package.md`     | `frontend/ui/**`                                                     |
| `api-package.md`    | `api/**`                                                             |
| `testing.md`        | File test, cấu hình test                                             |
| `giong-van.md`      | File giao diện, messages, schema, service (chữ hiển thị)             |

## Skills

| Skill                | Dùng khi                                                                                |
| -------------------- | --------------------------------------------------------------------------------------- |
| `tao-tinh-nang`      | Làm một tính năng đi qua nhiều phần (điều phối các skill dưới)                          |
| `tao-module-backend` | Thêm module / endpoint NestJS                                                           |
| `prisma-migration`   | Đổi schema database                                                                     |
| `trang-admin-crud`   | Làm màn hình trong admin                                                                |
| `man-hinh-mobile`    | Làm màn hình trên app                                                                   |
| `them-component-ui`  | Thêm component nền hoặc đổi token trong `ui`                                            |
| `agent-browser`      | Mở web/admin bằng trình duyệt thật: bấm, điền form, chụp màn hình để kiểm tra giao diện |

`agent-browser` cần CLI cài riêng trên máy (một lần): `npm i -g agent-browser && agent-browser install`. File `SKILL.md` chỉ là stub; hướng dẫn thật lấy từ CLI bằng `agent-browser skills get core`.

## Agents

| Agent                | Quyền               | Dùng khi                              |
| -------------------- | ------------------- | ------------------------------------- |
| `kiem-tra-bao-mat`   | Chỉ đọc             | Trước khi merge tính năng ghi dữ liệu |
| `review-code`        | Chỉ đọc             | Cần ý kiến độc lập về code            |
| `kiem-tra-hieu-nang` | Chỉ đọc             | Chậm, trước khi deploy                |
| `viet-test`          | Đọc + ghi file test | Bổ sung test                          |

## Commands

| Lệnh              | Làm gì                                    |
| ----------------- | ----------------------------------------- |
| `/tiep-theo`      | Đọc lộ trình, gợi ý một việc nên làm tiếp |
| `/review [nhánh]` | Review thay đổi so với `main`             |
| `/db-reset`       | Làm mới database dev (có hỏi xác nhận)    |
| `/fix-issue <số>` | Đọc issue GitHub và sửa                   |
| `/commit`         | Soạn commit message                       |

## Hooks

- `protect-files.mjs` (trước khi sửa): chặn sửa `.env`, `pnpm-lock.yaml`, migration Prisma đã commit, code Prisma tự sinh.
- `format-file.mjs` (sau khi sửa): chạy Prettier cho file vừa sửa. Cần `pnpm install` ở gốc; chưa có Prettier thì tự bỏ qua.

Hooks chạy bằng `node`, dùng được trên Windows, macOS, Linux.

## File cá nhân (không commit)

- `../CLAUDE.local.md`: ghi chú riêng cho máy bạn (chép từ `.claude/CLAUDE.local.md.example`)
- `settings.local.json`: quyền riêng cho máy bạn

## Thêm mới

- Rule: `rules/<ten>.md`, thêm `paths:` ở đầu nếu chỉ áp dụng cho một số thư mục.
- Skill: `skills/<ten>/SKILL.md` với `name`, `description` (ghi rõ **khi nào** dùng; Claude dựa vào đó để chọn). Có thể kèm file mẫu trong cùng thư mục.
- Agent: `agents/<ten>.md` với `name`, `description`, `tools`, `model`.
- Command: `commands/<ten>.md`; `$ARGUMENTS` để nhận tham số.

Giữ `.claude/CLAUDE.md` dưới khoảng 200 dòng; thứ chỉ cần cho một phần thì đưa vào `CLAUDE.md` của phần đó hoặc `rules/`.
