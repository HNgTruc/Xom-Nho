# apps/web

Next.js App Router: giao diện web, trang quản trị, API `/api/v1` cho app, Prisma.

## Trước khi viết code

- Next.js bản mới có nhiều thay đổi phá vỡ. Đọc `AGENTS.md` (do Next.js tạo) và tài liệu trong `node_modules/next/dist/docs/` cho API định dùng.
- Kiểm tra `next.config.ts`: nếu bật `cacheComponents`, cách cache và dữ liệu động khác với bản cũ.

## Tầng và trách nhiệm

| Thư mục                             | Làm gì                                                                       | Không làm gì                                         |
| ----------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| `src/app/**/page.tsx`, `layout.tsx` | Lấy dữ liệu qua service, ghép component                                      | Gọi Prisma trực tiếp, chứa logic nghiệp vụ           |
| `src/server/actions/`               | Server Action: lấy phiên, gọi service, `revalidatePath`                      | Kiểm tra quyền tự viết (để service lo)               |
| `src/app/api/v1/`                   | Route Handler cho app: đọc request, gọi service, trả JSON đúng `docs/api.md` | Logic nghiệp vụ                                      |
| `src/server/services/`              | Toàn bộ quy tắc: Zod, quyền, Prisma, trả `Result`                            | Đọc `cookies()`/`headers()` (nhận user từ tầng trên) |
| `src/lib/auth/`                     | Cấu hình Better Auth, hàm quyền                                              |                                                      |
| `src/components/ui/`                | shadcn/ui, không sửa trừ khi cần đổi style chung                             |                                                      |
| `src/components/features/`          | Component theo tính năng                                                     |                                                      |

## Quy ước

- Mặc định Server Component. Chỉ thêm `"use client"` cho phần cần tương tác (form, nút, trình soạn), và đẩy ranh giới client xuống thấp nhất có thể.
- Form dùng Server Action + `useActionState`, kiểm tra bằng schema từ `@xom-nho/shared`.
- Đường dẫn tiếng Việt không dấu: `/bai-viet/[slug]`, `/danh-muc/[slug]`, `/tag/[slug]`, `/u/[username]`, `/tim-kiem`, `/viet-bai`, `/admin/...`.
- Mọi trang có `generateMetadata` hoặc `metadata` tiếng Việt.
- Ngày giờ hiển thị theo `Asia/Ho_Chi_Minh`, kiểu "2 giờ trước" cho dưới 7 ngày, còn lại "12/10/2026".
- Ảnh dùng `next/image`.

## Lệnh

```bash
pnpm --filter web dev
pnpm --filter web db:migrate      # prisma migrate dev
pnpm --filter web db:studio       # prisma studio (ngoài Adminer)
pnpm --filter web db:seed
pnpm --filter web test            # vitest
pnpm --filter web test:e2e        # playwright
```
