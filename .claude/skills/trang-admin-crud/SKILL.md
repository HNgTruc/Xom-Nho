---
name: trang-admin-crud
description: Dựng màn hình quản trị dạng bảng (danh sách, lọc, tìm, phân trang, thêm/sửa/xóa, duyệt) trong frontend/admin (React + Vite) của Xóm Nhỏ. Dùng khi làm bất kỳ màn hình nào của trang quản trị, gồm duyệt bài, bài viết, bình luận, danh mục, tag, thành viên, tổng quan.
---

# Màn hình quản trị

## Trước khi làm

- API `/api/v1/admin/<tài-nguyên>` đã có ở backend và trong `api/src/api-client/admin/` chưa? Chưa thì dùng skill `tao-module-backend` trước.
- Đọc mục "Quản trị" trong `docs/tinh-nang.md` và `.claude/rules/frontend-admin.md`.

## Cấu trúc một feature

```
frontend/admin/src/features/<ten>/
├── pages/
│   ├── <Ten>ListPage.tsx       đọc searchParams, gọi query, render bảng
│   └── <Ten>EditPage.tsx       (nếu cần trang riêng)
├── components/
│   ├── <Ten>Table.tsx          định nghĩa cột cho DataTable
│   ├── <Ten>Filters.tsx        ô tìm + bộ lọc, đồng bộ URL
│   └── <Ten>FormDialog.tsx     thêm/sửa
├── api/
│   └── <ten>.queries.ts        query keys, useXxxList, useXxxMutation
└── index.ts                    export routes của feature
```

Đăng ký route trong `src/app/router.tsx` (lazy load), thêm mục vào `src/app/layout/Sidebar.tsx`.

## Bắt buộc

1. **Trạng thái trên URL**: `page`, `pageSize`, `q`, bộ lọc, `sort` trong `useSearchParams`; ô tìm debounce 300ms.
2. **Query key đủ tham số**: `["admin", "posts", { page, q, status, sort }]`. Sau mutation `invalidateQueries({ queryKey: ["admin", "posts"] })`.
3. **Bảng**: dùng `components/data-table`, phân trang ở server, có trạng thái đang tải (skeleton), lỗi (thử lại), trống.
4. **Hành động nguy hiểm** (xóa, cấm, từ chối): `ConfirmDialog` nêu rõ hậu quả; từ chối và cấm bắt buộc nhập lý do. Toast sau khi xong.
5. **Trạng thái bài** hiển thị bằng `StatusBadge`: Bản nháp xám, Chờ duyệt vàng, Đã đăng xanh lá, Bị từ chối đỏ, Đã ẩn xám nhạt.
6. Không cho admin tự hạ quyền hoặc tự cấm mình (ẩn nút; backend cũng chặn).

## Component nên dùng (`@xom-nho/ui`)

`table`, `input`, `select`, `badge`, `dropdown-menu` (hành động mỗi dòng), `dialog`, `alert-dialog`, `pagination`, `sonner`, `card`, `skeleton`, `tabs`.

## Hoàn tất

- Đối chiếu tiêu chí "Quản trị" trong `docs/tinh-nang.md`.
- Thử với tài khoản admin; thử đăng nhập bằng tài khoản thường (phải bị từ chối).
- `pnpm --filter admin typecheck`, `pnpm --filter admin build`.
