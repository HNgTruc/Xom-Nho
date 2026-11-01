# 0001. Chọn công nghệ chính

- Trạng thái: Đã chấp nhận, thay thế một phần bởi [0002](0002-tach-backend-va-admin.md) (backend tách riêng, admin riêng, cấu trúc thư mục)
- Ngày: 2026-11-01

## Bối cảnh

Xóm Nhỏ là project cá nhân làm ngoài giờ, cần cả web và app điện thoại, một người làm, muốn cách làm chuyên nghiệp để đưa lên GitHub.

## Quyết định

| Vấn đề           | Chọn                               | Lý do                                                                                   | Đã cân nhắc                                                                         |
| ---------------- | ---------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Ngôn ngữ         | TypeScript ở mọi nơi               | Một ngôn ngữ cho web, app, server; chia sẻ kiểu                                         |                                                                                     |
| Tổ chức code     | Monorepo pnpm + Turborepo          | Chia sẻ schema/kiểu giữa web và app, một repo                                           | Hai repo riêng (khó đồng bộ kiểu)                                                   |
| Web              | Next.js App Router                 | Web + API + server trong một chỗ, SEO tốt                                               | Vite + Express riêng                                                                |
| App              | Expo + Expo Router                 | Dùng lại kiến thức React, chạy thử bằng Expo Go không cần Android Studio                | Flutter (khác ngôn ngữ), PWA (trải nghiệm kém hơn)                                  |
| CSDL             | MySQL 8.4                          | Quen thuộc, nhiều hosting rẻ, FULLTEXT đủ dùng                                          | SQL Server (image nặng), PostgreSQL                                                 |
| Chạy CSDL        | Docker Compose, chỉ CSDL + Adminer | Không cài MySQL vào máy, ai clone cũng chạy giống nhau; app chạy ngoài Docker cho nhanh | Đưa cả app vào Docker (chậm trên Windows)                                           |
| ORM              | Prisma                             | Schema dễ đọc, migration rõ ràng, kiểu tự sinh                                          | Drizzle                                                                             |
| Đăng nhập        | Better Auth                        | Hỗ trợ sẵn email/mật khẩu, OAuth, vai trò, và có plugin Expo                            | Auth.js (hạn chế với email/mật khẩu và app), Clerk (dịch vụ ngoài, trả phí khi lớn) |
| Giao diện web    | Tailwind + shadcn/ui               | Component đẹp sẵn, sửa được mã nguồn                                                    | MUI                                                                                 |
| Kiểm tra dữ liệu | Zod                                | Dùng được ở cả web, app, server                                                         |                                                                                     |
| Nội dung         | Markdown                           | Đơn giản, lưu dạng chữ, an toàn hơn HTML                                                | Trình soạn trực quan (Tiptap)                                                       |

## Hệ quả

- Server Actions chỉ dùng được từ web, nên phải viết thêm REST `/api/v1` cho app. Giảm trùng lặp bằng cách gom logic vào tầng service.
- Next.js, Expo, Prisma, Better Auth cập nhật nhanh; phải đọc tài liệu theo đúng bản đã cài.
- Tìm kiếm tiếng Việt cần cột `searchText` bỏ dấu (xem `co-so-du-lieu.md`).
