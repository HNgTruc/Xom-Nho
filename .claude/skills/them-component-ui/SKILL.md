---
name: them-component-ui
description: Thêm hoặc sửa component nền và design token trong ui/ (design system dùng chung của Xóm Nhỏ) để web và admin dùng chung, mobile dùng token. Dùng khi web hoặc admin cần một component nền chưa có (nút, hộp thoại, bảng, ô chọn...), khi đổi màu/font/khoảng cách, hoặc khi thấy component bị chép lặp giữa web và admin.
---

# Thêm component vào ui

## Quyết định trước

- Component có **biết nghiệp vụ** không (bài viết, bình luận, vai trò, gọi API)? Có → **không** đưa vào `ui`; đặt trong `features/` của frontend cần nó.
- Chỉ một frontend dùng và rất đặc thù? Để trong frontend đó, khi frontend thứ hai cần mới chuyển vào `ui`.
- Component nền, web và admin cùng dùng được → vào `ui`.

## Thêm component shadcn

```bash
cd ui
pnpm dlx shadcn@latest add <ten>
```

Sau đó:

1. Kiểm tra file nằm ở `ui/src/components/<ten>.tsx`, import `cn` từ `../lib/utils`.
2. Thay mã màu cứng (nếu có) bằng class theo theme (`bg-primary`, `text-muted-foreground`).
3. Đổi chữ mặc định sang tiếng Việt (ví dụ nút đóng có `sr-only` "Đóng").
4. Nếu `package.json` có danh sách `exports` cụ thể thì thêm đường dẫn; nếu dùng `./components/*` thì không cần.
5. Dùng thử ở web hoặc admin: `import { Button } from "@xom-nho/ui/components/button"`.

## Sửa token

1. Sửa `ui/src/tokens/<loại>.ts`.
2. Sửa giá trị tương ứng trong `ui/src/styles/theme.css` (cả sáng và tối).
3. Kiểm tra `frontend/mobile-app/src/theme` có cần cập nhật tên token không.
4. Cập nhật bảng màu trong `docs/giong-van-va-giao-dien.md` nếu đổi màu chủ đạo.
5. Kiểm tra độ tương phản WCAG AA cho cặp chữ/nền vừa đổi.

## Sửa props của component đang dùng

Tìm mọi chỗ dùng trong `frontend/web` và `frontend/admin`, sửa cùng lúc, rồi `pnpm typecheck` ở gốc.
