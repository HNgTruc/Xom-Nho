---
paths:
  - "database/prisma/**"
  - "backend/prisma.config.ts"
  - "backend/src/infrastructure/database/**"
  - "backend/src/modules/**/*.repository.ts"
---

# Quy tắc Prisma + MySQL

- Đọc `docs/co-so-du-lieu.md` trước khi đổi schema; đổi xong thì cập nhật tài liệu đó trong cùng commit.
- Prisma đổi cấu hình giữa các bản lớn (`prisma.config.ts`, generator `prisma-client` với `output`, driver adapter cho MySQL). Làm theo tài liệu của **bản đã cài**.
- Prisma client sinh ra ở `backend/src/generated/`, chỉ được dùng qua `PrismaService` trong `infrastructure/database`. Chỉ file `*.repository.ts` được gọi `PrismaService`.
- Không sửa migration đã commit. Đổi schema → `prisma migrate dev --name <ten_tieng_anh>` (dùng skill `prisma-migration`).
- Đặt tên: model PascalCase số ít, trường camelCase, enum viết hoa. Dùng `@@map`/`@map` nếu muốn tên bảng/cột snake_case.
- Khóa chính `String @id @default(cuid())`, trừ bảng do Better Auth quản lý.
- Chuỗi dài: `@db.Text`; chuỗi ngắn: `@db.VarChar(n)` (tiêu đề 200, slug 220).
- `@@index` cho mọi cột dùng để lọc/sắp xếp thường xuyên.
- Quan hệ ghi rõ `onDelete`.
- Repository chỉ truy vấn, không có quy tắc nghiệp vụ hay kiểm tra quyền. Luôn `select` đúng cột cần.
- Seed (`backend/scripts/seed.ts`) chạy lại được nhiều lần.
- Đổi schema xong: `prisma format`, `prisma validate`, rồi mới tạo migration.
