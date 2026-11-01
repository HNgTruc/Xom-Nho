# @xom-nho/shared

Code dùng chung cho `backend` và cả ba frontend. Chưa khởi tạo, xem giai đoạn 0 trong [docs/lo-trinh.md](../docs/lo-trinh.md).

## Cấu trúc

```
src/
├── schemas/          Zod cho dữ liệu vào: post.ts, comment.ts, user.ts, category.ts, tag.ts, query.ts
├── types/            kiểu phản hồi API (PostListItem, PostDetail, ApiResponse<T>, Paginated<T>), Result<T, E>
├── constants/        roles.ts, post-status.ts, limits.ts, error-codes.ts, messages.ts (chữ tiếng Việt)
├── utils/            slugify.ts, remove-vietnamese-tones.ts, format-relative-time.ts
├── api-client/
│   ├── create-client.ts    nhận { baseUrl, fetch?, headers?, credentials? }, trả object có kiểu
│   ├── errors.ts           ApiError (code, message, fields)
│   ├── posts.ts            list, get, create, update, remove
│   ├── comments.ts
│   ├── categories.ts, tags.ts, users.ts, me.ts
│   └── admin/              posts.ts, comments.ts, users.ts, dashboard.ts...
└── index.ts
```

`api-client` chỉ dùng `fetch` chuẩn nên chạy được trên trình duyệt, Node (Server Components của Next.js) và React Native. Mỗi frontend tạo một client với cấu hình của mình (`frontend/*/src/lib/api.ts`).

## Không được để ở đây

- Code import `next`, `react`, `react-native`, `expo-*`, `@nestjs/*`, `@prisma/client`, `node:*`.
- Đọc biến môi trường.
- Kiểu sinh từ Prisma (frontend không cài Prisma). Backend dùng mapper để chuyển sang kiểu ở đây.

## Khởi tạo

- `package.json`: `"name": "@xom-nho/shared"`, `"type": "module"`, `"exports"` trỏ vào `src/index.ts` và `src/api-client/index.ts` (`"./api-client"`).
- Phụ thuộc duy nhất: `zod`.
- Vitest cho `utils/` và `schemas/`.

Các package khác khai báo: `"@xom-nho/shared": "workspace:*"`.
