---
paths:
  - "backend/src/**"
---

# Quy tắc backend NestJS

- Mỗi tính năng là một module trong `src/modules/<tính-năng>/` theo mẫu: `module`, `controller`, `admin.controller`, `service`, `policy`, `repository`, `mapper`, `service.spec`. Xem `docs/kien-truc.md`.
- Tầng chỉ gọi tầng ngay dưới: controller → service → (policy, repository) → Prisma. Controller không gọi repository; service không đọc `Request`.
- Module khác cần dữ liệu thì import **module** và gọi **service** được export; không import repository của module khác.
- Route công khai đặt `@Public()`. Route admin nằm trong `*.admin.controller.ts`, `@Controller("admin/<tài-nguyên>")` + `@Roles("admin")` ở cấp class.
- Body, query, param kiểm tra bằng `new ZodValidationPipe(<schema từ @xom-nho/shared>)`. Không dùng `class-validator`/DTO class.
- Lỗi nghiệp vụ: `throw new AppException("NOT_FOUND", "Không tìm thấy bài viết")` với mã trong `shared/src/constants/error-codes.ts`. Không ném `HttpException` trực tiếp, không trả `{ error }` tự chế.
- Controller trả dữ liệu thuần (hoặc `{ items, meta }` cho danh sách); interceptor lo bọc `{ data, meta }`.
- Repository luôn `select` đúng cột cần; danh sách không lấy `content` của bài.
- Thao tác ghi nhiều bảng (bài + tag) dùng `prisma.$transaction`.
- Mapper chuyển Prisma model sang kiểu trong `@xom-nho/shared`; không trả Prisma model thẳng ra ngoài.
- Biến môi trường chỉ qua `ConfigService`; không `process.env` rải rác.
- Không `console.log`; dùng logger trong `infrastructure/logger`.
- Đăng ký module mới trong `app.module.ts`.
- Thêm/đổi endpoint: cập nhật `docs/api.md` và `shared/src/api-client` trong cùng thay đổi.
