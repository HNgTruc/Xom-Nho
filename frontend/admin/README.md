# frontend/admin

Trang quản trị Xóm Nhỏ: React 19 + Vite 8, React Router 8 (data router), TanStack Query, Tailwind CSS v4 qua theme của `@xom-nho/ui`. Quy ước code: [CLAUDE.md](CLAUDE.md).

## Chạy

```bash
pnpm dev:admin                   # backend + admin, http://localhost:5173
pnpm --filter admin build
pnpm --filter admin typecheck
pnpm --filter admin lint
```

Biến môi trường (`.env.local`, không bắt buộc khi chạy trên máy):

| Biến           | Mặc định                | Ghi chú                                                              |
| -------------- | ----------------------- | -------------------------------------------------------------------- |
| `VITE_API_URL` | `http://localhost:4000` | Công khai. Origin của admin phải có trong `CORS_ORIGINS` của backend |

## Ghi chú cài đặt

- Tạo bằng `create-vite@9.3.3 --template react-ts` ở thư mục tạm rồi chép vào. Đổi TypeScript 7 của template về bản 6 dùng chung (catalog), bật `strict` qua `tsconfig.base.json` ở gốc.
- Tailwind qua plugin `@tailwindcss/vite`; alias `@/*` đọc từ `tsconfig.app.json` (`resolve.tsconfigPaths` của Vite 8).
- Font Be Vietnam Pro nạp bằng `@fontsource/be-vietnam-pro` trong `src/main.tsx`.
- Mỗi trang lazy load qua `lazy` của route (xem `src/features/dashboard/index.ts`).
- Còn thêm khi tới giai đoạn 5: TanStack Table, `AdminLayout`, `require-admin`.
