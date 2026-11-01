# ui

Design system của Xóm Nhỏ (package `@xom-nho/ui`). Hai phần với hai đối tượng khác nhau:

| Phần      | Đường dẫn import               | Dùng ở                     | Được phụ thuộc vào         |
| --------- | ------------------------------ | -------------------------- | -------------------------- |
| Token     | `@xom-nho/ui/tokens`           | web, admin, **mobile-app** | không gì cả (TS thuần)     |
| Theme CSS | `@xom-nho/ui/styles/theme.css` | web, admin                 | Tailwind CSS v4            |
| Component | `@xom-nho/ui/components/<ten>` | web, admin                 | React DOM, Radix, Tailwind |

## Cấu trúc

```
src/
├── tokens/
│   ├── colors.ts          bảng màu sáng/tối theo docs/giong-van-va-giao-dien.md
│   ├── typography.ts      font, cỡ chữ, độ cao dòng
│   ├── spacing.ts
│   ├── radius.ts
│   └── index.ts
├── styles/
│   └── theme.css          biến CSS (--background, --primary...) + @theme cho Tailwind, khớp với tokens
├── components/            shadcn/ui, mỗi component một file: button.tsx, input.tsx, dialog.tsx, table.tsx...
├── hooks/                 hook giao diện dùng chung (use-media-query...)
├── lib/utils.ts           cn()
└── index.ts
components.json            cấu hình shadcn CLI cho thư mục này
```

## Quy tắc

- `tokens/` **không import gì** (không React, không CSS) để React Native dùng được.
- Đổi màu: sửa `tokens/colors.ts` **và** `styles/theme.css` cùng lúc, hai nơi phải khớp. (Có thể viết script sinh `theme.css` từ tokens sau này.)
- Component ở đây chỉ là **component nền, không biết gì về nghiệp vụ**: không gọi API, không biết "bài viết", "bình luận". Component có nghiệp vụ (PostCard, CommentThread) nằm trong `features/` của từng frontend.
- Thêm component bằng shadcn CLI chạy trong thư mục `ui/`, rồi chỉnh màu theo token. Không sao chép component vào web/admin.
- Chữ mặc định trong component (nếu có, ví dụ "Đóng" của Dialog) viết tiếng Việt.
- Mỗi component có `aria-*` đúng chuẩn; giữ nguyên khả năng tiếp cận của Radix.
- Đổi API của component đang dùng: tìm chỗ dùng trong `frontend/web` và `frontend/admin`, sửa cùng lúc.
