---
paths:
  - "frontend/web/**"
---

# Quy tắc frontend/web (Next.js)

- Web **không có database và không có API riêng**. Đọc/ghi dữ liệu qua `@xom-nho/shared/api-client` (cấu hình ở `src/lib/server-api.ts` và `src/lib/browser-api.ts`).
- `src/app/` chỉ định tuyến: lấy tham số, gọi dữ liệu, ghép component từ `src/features/`. Không viết giao diện dài hay logic trong `page.tsx`.
- Code theo tính năng trong `src/features/<tính-năng>/{components,api,hooks}`, export ra ngoài qua `index.ts`. Feature không import vào bên trong feature khác.
- Đọc dữ liệu: Server Component + `server-api.ts` (chuyển tiếp cookie người dùng). Ghi dữ liệu: Client Component + `browser-api.ts` + TanStack Query `useMutation`, xong thì `router.refresh()` hoặc invalidate.
- Mặc định Server Component; `"use client"` chỉ cho phần tương tác, đẩy ranh giới client xuống thấp nhất.
- Component nền (Button, Input, Dialog, Card...) import từ `@xom-nho/ui/components/*`. Không tạo bản sao trong web; thiếu thì thêm vào `ui` (skill `them-component-ui`).
- Màu, font dùng class theo theme (`bg-background`, `text-primary`), không mã màu cứng.
- Trang có tham số gọi `notFound()` khi backend trả `NOT_FOUND`.
- Route `(author)/*` kiểm tra phiên ở server, chưa đăng nhập thì chuyển tới `/dang-nhap?next=...`.
- Mỗi route có `loading.tsx` hoặc `<Suspense>`, các nhánh chính có `error.tsx`.
- Mọi trang có `metadata` tiếng Việt; trang bài viết có Open Graph.
- Ảnh `next/image` có `alt`, liên kết `next/link`, font `next/font`.
- Không có gì của trang quản trị ở đây.
