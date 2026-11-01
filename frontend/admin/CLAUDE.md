# frontend/admin

Trang quản trị của Xóm Nhỏ: React + Vite, ứng dụng một trang (SPA). **Chỉ trưởng xóm (`admin`) dùng.** Gọi `backend` ở `/api/v1/admin/*` qua `@xom-nho/shared/api-client`.

## Cấu trúc

```
src/
├── main.tsx
├── app/
│   ├── providers.tsx           QueryClient, theme, toast
│   ├── router.tsx              khai báo route (React Router)
│   ├── require-admin.tsx       chặn route khi chưa đăng nhập / không phải admin
│   └── layout/                 AdminLayout, Sidebar, Topbar, Breadcrumb
├── features/
│   ├── auth/                   trang đăng nhập admin
│   ├── dashboard/              thẻ số liệu, biểu đồ
│   ├── moderation/             hàng chờ duyệt bài
│   ├── posts/                  bảng bài viết, sửa/xóa/ẩn
│   ├── comments/               bảng bình luận, ẩn/hiện
│   ├── categories/             thêm/sửa/sắp xếp
│   ├── tags/                   gộp, xóa
│   └── users/                  đổi vai trò, cấm
├── components/
│   ├── data-table/             DataTable dùng chung (TanStack Table): phân trang, sắp xếp, lọc
│   └── common/                 PageHeader, ConfirmDialog, StatusBadge, EmptyState
├── lib/
│   ├── api.ts                  api-client (credentials: include, baseUrl từ VITE_API_URL)
│   ├── auth-client.ts
│   └── query-client.ts
├── hooks/                      useDebounce, useUrlState...
└── styles/globals.css          import theme từ @xom-nho/ui
```

Mỗi feature:

```
features/posts/
├── pages/                      PostsListPage.tsx, PostEditPage.tsx
├── components/                 PostsTable.tsx, PostFilters.tsx, RejectDialog.tsx
├── api/                        posts.queries.ts (useQuery, useMutation, query keys)
└── index.ts                    export route của feature
```

## Quy ước

- Route khai báo tập trung ở `app/router.tsx`, mỗi feature export các route của nó; lazy load từng trang.
- **Trạng thái lọc, trang, từ khóa lưu trên URL** (`?page=2&status=PENDING&q=...`) để tải lại hay gửi link vẫn giữ nguyên.
- Dữ liệu server chỉ qua TanStack Query; không lưu bản sao vào state cục bộ. Sau mutation thì `invalidateQueries`.
- Mọi bảng dùng `components/data-table`, phân trang ở server.
- Hành động nguy hiểm (xóa, cấm, từ chối) qua `ConfirmDialog`; từ chối và cấm bắt buộc nhập lý do.
- Component nền import từ `@xom-nho/ui`.
- `require-admin.tsx` chỉ để trải nghiệm tốt hơn; **backend mới là nơi chặn thật**.
- Biến môi trường có tiền tố `VITE_` là công khai, không để bí mật vào.

## Lệnh

```bash
pnpm --filter admin dev            # http://localhost:5173
pnpm --filter admin build
pnpm --filter admin test
```
