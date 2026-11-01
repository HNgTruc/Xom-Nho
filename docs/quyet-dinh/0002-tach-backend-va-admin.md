# 0002. Tách backend NestJS riêng và trang quản trị riêng

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-01
- Thay thế một phần [0001](0001-chon-cong-nghe.md) (mục "Web" và cách tổ chức thư mục)

## Bối cảnh

Thiết kế ban đầu để Next.js vừa làm web, vừa làm API cho app, vừa chứa trang quản trị, code đặt trong `apps/` và `packages/`. Khi thêm app điện thoại và muốn bảo trì lâu dài, cách này có nhược điểm:

- Logic nghiệp vụ bị chia giữa Server Actions (cho web) và Route Handlers (cho app).
- Trang quản trị nằm chung với web: tăng kích thước, khó tách quyền truy cập và deploy riêng.
- Backend gắn chặt vào Next.js; muốn đổi frontend thì phải tách lại.

## Quyết định

| Vấn đề                     | Chọn                                                            | Lý do                                                                                                                             | Đã cân nhắc                                                      |
| -------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Backend                    | **NestJS** riêng ở `backend/`                                   | Chia module, controller, service, DI rõ ràng; giống ASP.NET nên dễ tiếp cận với người đã học C#; cả 3 frontend dùng chung một API | Express/Hono (ít quy tắc, dễ lộn xộn khi lớn), giữ trong Next.js |
| Trang quản trị             | **React + Vite** riêng ở `frontend/admin/`                      | Không cần SEO nên SPA là đủ; nhẹ, khởi động nhanh; tách deploy                                                                    | Next.js (nặng hơn mức cần), Refine (thêm một framework phải học) |
| Tổ chức thư mục            | `backend/`, `frontend/{web,admin,mobile-app}`, `ui/`, `shared/` | Nhìn là biết đâu là server, đâu là giao diện                                                                                      | `apps/` + `packages/`                                            |
| Giao diện dùng chung       | `ui/`: token cho cả 3, component shadcn cho web + admin         | Một nguồn màu sắc; component web không ép lên React Native                                                                        | Chỉ token; Tamagui cho cả 3 (phức tạp)                           |
| Kiểm tra dữ liệu ở backend | Zod qua `ZodValidationPipe`                                     | Dùng chung schema với frontend                                                                                                    | `class-validator` (phải khai báo lại lần hai)                    |
| Gọi API                    | `shared/api-client` có kiểu                                     | Mọi frontend gọi giống nhau; đổi API là TypeScript báo lỗi                                                                        | Mỗi frontend tự viết `fetch`                                     |

## Hệ quả

- Web không còn Server Actions ghi dữ liệu; đọc bằng Server Components gọi backend (chuyển tiếp cookie), ghi bằng client component + TanStack Query.
- Cần cấu hình CORS và cookie giữa các cổng (dev) và tên miền con (deploy).
- Thêm một tiến trình phải chạy khi dev (backend :4000); dùng `pnpm dev` (turbo) để bật cùng lúc.
- Better Auth chạy trong NestJS thay vì Next.js; theo dõi tài liệu tích hợp NestJS của Better Auth.
