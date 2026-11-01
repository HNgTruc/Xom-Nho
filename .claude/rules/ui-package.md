---
paths:
  - "ui/**"
---

# Quy tắc ui (design system)

- `src/tokens/` là TypeScript thuần, **không import gì** (không React, không CSS), vì mobile-app dùng chung.
- Đổi màu/font/khoảng cách: sửa `src/tokens/*` **và** `src/styles/theme.css` cùng lúc; hai nơi phải khớp giá trị.
- `src/components/` chỉ chứa component nền **không biết nghiệp vụ**: không gọi API, không biết bài viết, bình luận, vai trò. Component nghiệp vụ nằm trong `features/` của từng frontend.
- Component thêm bằng shadcn CLI chạy trong `ui/`, rồi chỉnh theo token. Mỗi component một file kebab-case, export tên PascalCase.
- Giữ nguyên khả năng tiếp cận của Radix (`aria-*`, focus, bàn phím). Chữ mặc định trong component viết tiếng Việt.
- Không import từ `frontend/*`, `backend`, hay `shared` (ui độc lập hoàn toàn).
- Đổi props của component đang dùng: tìm chỗ dùng trong `frontend/web` và `frontend/admin`, sửa cùng lúc, rồi `pnpm typecheck` ở gốc.
