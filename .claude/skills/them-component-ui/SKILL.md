---
name: them-component-ui
description: Thêm hoặc sửa component nền và design token trong frontend/ui/ (design system dùng chung của Xóm Nhỏ) để web và admin dùng chung, mobile dùng token. Dùng khi web hoặc admin cần một component nền chưa có (nút, hộp thoại, bảng, ô chọn...), khi đổi màu/font/khoảng cách, hoặc khi thấy component bị chép lặp giữa web và admin.
---

# Thêm component vào ui

## Quyết định trước

- Component có **biết nghiệp vụ** không (bài viết, bình luận, vai trò, gọi API)? Có → **không** đưa vào `ui`; đặt trong `features/` của frontend cần nó.
- Chỉ một frontend dùng và rất đặc thù? Để trong frontend đó, khi frontend thứ hai cần mới chuyển vào `ui`.
- Component nền, web và admin cùng dùng được → vào `ui`.

## Thêm component shadcn

```bash
cd ui
pnpm dlx shadcn@4.23.0 add <ten>
```

Sau đó:

1. Kiểm tra file nằm ở `frontend/ui/src/components/<ten>.tsx` (import `cn` từ package `cn`, component khác qua `@xom-nho/ui/components/...`).
2. Thay mã màu cứng (nếu có) bằng class theo theme (`bg-primary`, `text-muted-foreground`).
3. Chỉnh khác biệt quen thuộc của preset `radix-nova` so với MASTER: bo góc (`rounded-xl`/`4xl` → `sm`/`md`/`lg` theo MASTER mục 4), focus (`ring-3 ring-ring/50` → `ring-2 ring-ring ring-offset-2`), chiều cao điều khiển (≥ 40px), chữ ô nhập 16px, `leading-none` trên chữ (cắt dấu tiếng Việt), hover `/80` `/90` (→ `color-mix` với foreground).
4. Đổi chữ mặc định sang tiếng Việt (ví dụ nút đóng có `sr-only` "Đóng").
5. Tính tương phản cho mọi trạng thái có màu (thường, hover, chế độ tối) nếu đổi màu nền hay độ mờ.
6. Chạy `pnpm --filter @xom-nho/ui typecheck lint test`.
7. Dùng thử ở web hoặc admin: `import { Button } from "@xom-nho/ui/components/button"`.

## Sửa token

1. Sửa `frontend/ui/src/tokens/<loại>.ts`.
2. Sửa giá trị tương ứng trong `frontend/ui/src/styles/theme.css` (cả sáng và tối).
3. Kiểm tra `frontend/mobile-app/src/theme` có cần cập nhật tên token không.
4. Cập nhật bảng màu trong `docs/giong-van-va-giao-dien.md` nếu đổi màu chủ đạo.
5. Kiểm tra độ tương phản WCAG AA cho cặp chữ/nền vừa đổi.

## Sửa props của component đang dùng

Tìm mọi chỗ dùng trong `frontend/web` và `frontend/admin`, sửa cùng lúc, rồi `pnpm typecheck` ở gốc.
