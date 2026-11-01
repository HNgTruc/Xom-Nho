# @xom-nho/shared

Code dùng chung cho `apps/web` và `apps/mobile`. Chưa khởi tạo, xem giai đoạn 0 trong [docs/lo-trinh.md](../../docs/lo-trinh.md).

## Được để gì

```
src/
├── schemas/      Zod: dữ liệu vào (createPostSchema, createCommentSchema, searchQuerySchema...)
├── types/        Kiểu trả về API (PostListItem, PostDetail, ApiResponse<T>...), Result<T, E>
├── constants/    Vai trò, trạng thái bài, giới hạn (độ dài tiêu đề, số tag), messages tiếng Việt
├── utils/        slugify, removeVietnameseTones, formatRelativeTime
└── index.ts      export tất cả
```

## Không được để gì

- Code import `next`, `react-native`, `expo-*`, `@prisma/client`, hay bất cứ thứ gì chỉ chạy trên một nền tảng.
- Code đọc biến môi trường hoặc gọi mạng.
- Kiểu sinh từ Prisma (app không cài Prisma). Khai báo kiểu API riêng ở đây; service ở web chịu trách nhiệm chuyển dữ liệu Prisma sang kiểu này.

## Gợi ý khởi tạo

- `package.json` với `"name": "@xom-nho/shared"`, `"main"`/`"exports"` trỏ thẳng vào `src/index.ts` (không cần build bước riêng, Next.js và Metro đều đọc được TypeScript; Next.js cần thêm package vào `transpilePackages`).
- Phụ thuộc duy nhất: `zod`.
- Test bằng Vitest, đặc biệt cho `slugify` và `removeVietnameseTones`.

Các app khai báo phụ thuộc: `"@xom-nho/shared": "workspace:*"`.
