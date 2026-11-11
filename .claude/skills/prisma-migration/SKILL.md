---
name: prisma-migration
description: Thay đổi schema MySQL của Xóm Nhỏ an toàn bằng Prisma migration trong database/prisma (thêm bảng, cột, chỉ mục, quan hệ, đổi tên). Dùng khi cần sửa database/prisma/schema.prisma hoặc khi tính năng mới cần lưu dữ liệu mới.
---

# Đổi schema bằng Prisma migration

## 1. Chuẩn bị

- `pnpm db:ps`: MySQL phải `healthy`.
- `git status`: nên bắt đầu từ trạng thái sạch.
- Đọc `docs/co-so-du-lieu.md` và `.claude/rules/prisma-mysql.md`.
- Xem bản Prisma trong `backend/package.json` và cấu hình hiện có (`backend/prisma.config.ts` trỏ tới `database/prisma/`, generator). Làm theo tài liệu bản đó.

## 2. Thiết kế

Trình bày cho người dùng trước khi sửa:

- Model/cột/chỉ mục thêm hoặc đổi, kiểu, có cho `null` không, mặc định.
- Ảnh hưởng tới dữ liệu đang có (cột bắt buộc mới lấy giá trị gì, đổi tên giữ dữ liệu ra sao).
- Chỉ mục phục vụ truy vấn nào.

## 3. Thực hiện

```bash
# sửa database/prisma/schema.prisma
pnpm --filter backend exec prisma format
pnpm --filter backend exec prisma validate
pnpm --filter backend exec prisma migrate dev --name <ten_tieng_anh> --create-only
```

- `--create-only` để **đọc SQL trước khi áp dụng**. Có `DROP COLUMN`/`DROP TABLE` mà thật ra là đổi tên thì sửa thành `RENAME COLUMN`/`RENAME TABLE` (được sửa vì migration chưa áp dụng và chưa commit; hook chỉ chặn migration đã commit).
- Cột bắt buộc mới trên bảng có dữ liệu: thêm với `DEFAULT` hoặc cho `NULL`, cập nhật dữ liệu, migration sau mới đặt `NOT NULL`.
- FULLTEXT: kiểm tra bản Prisma này hỗ trợ `@@fulltext` cho MySQL chưa (có thể cần `previewFeatures`); không thì thêm bằng SQL trong migration.

```bash
pnpm --filter backend exec prisma migrate dev     # áp dụng + generate client
```

## 4. Sau khi áp dụng

- Cập nhật `backend/scripts/seed.ts`, chạy thử seed.
- Cập nhật `docs/co-so-du-lieu.md` (sơ đồ ER, bảng chỉ mục).
- Cập nhật repository, mapper, và kiểu trong `api/src/types` nếu dữ liệu trả về thay đổi.
- `pnpm typecheck` ở gốc.
- Nhắc chủ dự án commit migration cùng schema và tài liệu, đề xuất message `feat(backend): <mô tả>`. Claude không tự commit.

## Không bao giờ

- Sửa migration đã áp dụng hoặc đã commit.
- Chạy `prisma migrate reset` hay `db push` lên database có dữ liệu thật khi chưa hỏi.
