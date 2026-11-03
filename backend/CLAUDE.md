# backend

NestJS API cho Xóm Nhỏ. Nơi **duy nhất** chạm database và giữ quy tắc nghiệp vụ. Phục vụ cả web, admin, mobile-app.

## Trước khi viết code

- NestJS, Prisma, Better Auth đổi API giữa các bản lớn. Đọc tài liệu theo đúng bản trong `package.json`.
- Dự án sinh bằng Nest CLI 12: **ESM** (`"type": "module"`), import tương đối phải có đuôi `.js`; test bằng **Vitest** (`describe`/`it`/`expect` là global); lint bằng **oxlint**. TypeScript 6.0 (bản Nest CLI dùng), chưa lên 7.
- Cấu hình app dùng chung (tiền tố `/api/v1`, sau này CORS, pipe, filter) đặt trong `src/setup-app.ts`, gọi từ cả `main.ts` lẫn test e2e.
- Better Auth gắn vào Nest qua handler Node (`toNodeHandler`) trên adapter Express, ở `src/main.ts`, **trước** body parser của Nest. Có thư viện cộng đồng tích hợp sẵn; kiểm tra tài liệu Better Auth mục NestJS trước khi tự viết.

## Tầng và trách nhiệm

| Tầng       | File                                       | Làm                                                           | Không làm                      |
| ---------- | ------------------------------------------ | ------------------------------------------------------------- | ------------------------------ |
| Controller | `*.controller.ts`, `*.admin.controller.ts` | Khai báo route, guard, pipe; gọi service                      | Logic nghiệp vụ, gọi Prisma    |
| Service    | `*.service.ts`                             | Quy tắc nghiệp vụ, gọi policy, giới hạn tần suất, transaction | Đọc `Request`, trả HTTP status |
| Policy     | `*.policy.ts`                              | Hàm thuần trả `boolean`: ai được làm gì với bản ghi nào       | Gọi DB                         |
| Repository | `*.repository.ts`                          | Truy vấn Prisma, chọn đúng cột                                | Quy tắc, kiểm tra quyền        |
| Mapper     | `*.mapper.ts`                              | Prisma model → kiểu trong `@xom-nho/shared`                   |                                |

Mỗi tầng chỉ gọi tầng ngay dưới. Module khác muốn dùng dữ liệu của module này thì gọi qua **service** được export, không import repository của nhau.

## Route

- Công khai / người dùng: `/api/v1/<tài-nguyên>` trong `*.controller.ts`
- Quản trị: `/api/v1/admin/<tài-nguyên>` trong `*.admin.controller.ts`, gắn `@Roles("admin")` ở cấp class
- Mặc định mọi route **cần đăng nhập** (AuthGuard toàn cục); route công khai đánh dấu `@Public()`
- Định dạng phản hồi và mã lỗi theo `docs/api.md`; interceptor và exception filter trong `common/` lo phần bọc, controller chỉ trả dữ liệu hoặc ném `AppException(code, message)`

## Kiểm tra dữ liệu

Không dùng `class-validator`. Dữ liệu vào kiểm tra bằng schema Zod từ `@xom-nho/shared` qua `ZodValidationPipe`:

```ts
// minh họa
@Post()
create(@CurrentUser() user: SessionUser, @Body(new ZodValidationPipe(createPostSchema)) input: CreatePostInput) {
  return this.postsService.create(user, input);
}
```

Nhờ vậy frontend và backend kiểm tra bằng đúng một schema.

## Quy ước

- Tên file: `<tài-nguyên>.<loại>.ts` (`posts.service.ts`, `posts.admin.controller.ts`).
- Prisma client sinh ra ở `src/generated/` (đã gitignore), chỉ import qua `infrastructure/database`.
- Biến môi trường chỉ đọc qua `ConfigService` của `config/`, có schema Zod kiểm tra lúc khởi động; thiếu biến thì app không chạy.
- Log có cấu trúc qua `infrastructure/logger`; không `console.log` trong code chính thức.
- Test đơn vị đặt cạnh file (`*.spec.ts`), test e2e trong `test/e2e/`.

## Lệnh

```bash
pnpm --filter backend dev          # nest start --watch, http://localhost:4000
pnpm --filter backend test
pnpm --filter backend test:e2e     # chạy trên database <tên>_test, tự áp migration trước
pnpm --filter backend db:migrate   # prisma migrate dev
pnpm --filter backend db:seed
pnpm --filter backend db:studio
```
