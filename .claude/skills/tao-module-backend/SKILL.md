---
name: tao-module-backend
description: Tạo hoặc mở rộng module NestJS trong backend/src/modules của Xóm Nhỏ (controller, admin controller, service, policy, repository, mapper, test) theo đúng tầng và định dạng API. Dùng khi thêm tài nguyên mới, thêm endpoint /api/v1 hoặc /api/v1/admin, hoặc khi frontend cần dữ liệu mà backend chưa có.
---

# Tạo module backend

## Trước khi viết

1. Endpoint đã có trong `docs/api.md` chưa? Chưa thì thêm trước (method, đường dẫn, 🌐/🔒/🛡️, body, kiểu trả về) và xác nhận.
2. Schema Zod và kiểu phản hồi đã có trong `api` chưa? Chưa thì viết trước.
3. Đọc tài liệu NestJS bản đã cài nếu dùng tính năng mới (guard, interceptor, module động).
4. Xem một module đã có để làm theo cùng phong cách.

## Cấu trúc

```
backend/src/modules/<ten>/
├── <ten>.module.ts
├── <ten>.controller.ts           @Controller("<ten>")
├── <ten>.admin.controller.ts     @Controller("admin/<ten>") + @Roles("admin")   (nếu có)
├── <ten>.service.ts
├── <ten>.policy.ts
├── <ten>.repository.ts
├── <ten>.mapper.ts
├── <ten>.service.spec.ts
└── <ten>.policy.spec.ts
```

Tạo khung bằng Nest CLI nếu muốn (`nest g module`, `nest g controller`, `nest g service` với `--no-spec` rồi tự thêm spec), sau đó sắp lại theo cấu trúc trên.

## Thứ tự viết

1. **Policy**: hàm thuần `(user, record) => boolean` theo `docs/phan-quyen.md`. Viết test ngay (mỗi vai trò một ca).
2. **Repository**: hàm truy vấn với `select` rõ ràng, nhận tham số đã kiểm tra, trả Prisma model. Không quy tắc.
3. **Mapper**: Prisma model → kiểu trong `@xom-nho/api`.
4. **Service**: kiểm tra policy → giới hạn tần suất (nếu tạo nội dung) → repository (transaction nếu ghi nhiều bảng) → mapper. Lỗi ném `AppException(code, message)`.
5. **Controller**: route mỏng, mẫu:

   ```ts
   // minh họa, điều chỉnh theo bản NestJS đã cài
   @Post()
   create(
     @CurrentUser() user: SessionUser,
     @Body(new ZodValidationPipe(createCommentSchema)) input: CreateCommentInput,
   ) {
     return this.commentsService.create(user, input);
   }
   ```

   Route công khai thêm `@Public()`. Danh sách trả `{ items, meta }` để interceptor đưa `meta` ra ngoài.

6. **Admin controller** (nếu có): cùng service, `@Roles("admin")` ở cấp class.
7. **Module**: khai báo controller, provider; `exports` service nếu module khác cần. Đăng ký vào `app.module.ts`.
8. **Test**: service spec (mock repository) cho ca được phép, bị từ chối, không tìm thấy. E2e trong `backend/test/e2e/` cho ít nhất một route chính và một route admin (người thường nhận 403).

## Sau khi xong

- Thêm hàm tương ứng vào `api/src/api-client/`.
- Thử bằng tay (curl hoặc file `.http`): thành công, 400, 401, 403, 404.
- `pnpm --filter backend test`, `pnpm typecheck` ở gốc.
