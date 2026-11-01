# frontend/web

Next.js App Router. Trang cho **khách, hàng xóm, cây bút**: đọc, tìm, viết bài, bình luận, hồ sơ. **Không có trang quản trị** (ở `frontend/admin`). **Không có database, không có API riêng**: mọi dữ liệu lấy từ `backend` qua `@xom-nho/shared/api-client`.

## Trước khi viết code

Next.js bản mới có nhiều thay đổi phá vỡ. Đọc `AGENTS.md` (Next.js tạo) và tài liệu trong `node_modules/next/dist/docs/` cho API định dùng. Kiểm tra `next.config.ts` có bật `cacheComponents` không.

## Cấu trúc

```
src/
├── app/                        CHỈ định tuyến
│   ├── layout.tsx
│   ├── (site)/                 trang công khai
│   │   ├── page.tsx            trang chủ
│   │   ├── bai-viet/[slug]/
│   │   ├── danh-muc/[slug]/
│   │   ├── tag/[slug]/
│   │   ├── tim-kiem/
│   │   └── u/[username]/
│   ├── (auth)/                 dang-nhap/, dang-ky/
│   └── (author)/               cần đăng nhập: viet-bai/, bai-cua-toi/, sua-bai/[id]/
├── features/
│   ├── posts/                  PostCard, PostList, PostContent, api/
│   ├── comments/               CommentThread, CommentForm, api/
│   ├── editor/                 trình soạn Markdown + xem trước
│   ├── auth/                   form đăng nhập/đăng ký, nút OAuth
│   ├── search/
│   └── profile/
├── components/
│   ├── layout/                 SiteHeader, SiteFooter, Container
│   └── common/                 EmptyState, ErrorState, Pagination...
├── lib/
│   ├── server-api.ts           api-client cho Server Components (chuyển tiếp cookie)
│   ├── browser-api.ts          api-client cho Client Components (credentials: include)
│   ├── auth-client.ts          Better Auth client trỏ về backend
│   ├── markdown.tsx            render Markdown an toàn
│   └── query-client.ts
├── hooks/
└── styles/globals.css          import theme từ @xom-nho/ui
```

## Quy ước

- **Đọc dữ liệu** trong Server Component bằng `server-api.ts`. **Ghi dữ liệu** (đăng bài, bình luận) từ Client Component bằng `browser-api.ts` + TanStack Query `useMutation`, xong thì `router.refresh()` hoặc invalidate query.
- Trang trong `app/` chỉ lấy dữ liệu và ghép component từ `features/`; không viết giao diện dài trong `page.tsx`.
- Component nền (Button, Input, Dialog...) import từ `@xom-nho/ui`, không tạo bản sao trong web. Component chỉ web dùng thì để trong `features/` hoặc `components/`.
- Mặc định Server Component; `"use client"` chỉ cho phần tương tác, đặt ranh giới client thấp nhất có thể.
- Route `(author)/*`: kiểm tra phiên ở server, chưa đăng nhập thì chuyển tới `/dang-nhap?next=...`. Quyền thật vẫn do backend quyết.
- Mọi trang có `metadata` tiếng Việt; trang bài viết có Open Graph.
- Ảnh `next/image`, liên kết `next/link`, font `next/font`.

## Lệnh

```bash
pnpm --filter web dev            # http://localhost:3000 (backend phải chạy ở :4000)
pnpm --filter web test
pnpm --filter web test:e2e
```
