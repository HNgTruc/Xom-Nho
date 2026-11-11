# frontend/web

Trang web Xóm Nhỏ: Next.js 16 (App Router, Cache Components), Tailwind CSS v4 qua theme của `@xom-nho/ui`. Quy ước code: [CLAUDE.md](CLAUDE.md). Next.js bản này đổi nhiều: đọc [AGENTS.md](AGENTS.md) trước khi viết code.

## Chạy

```bash
pnpm dev:web                     # backend + web, http://localhost:3000
pnpm --filter web build
pnpm --filter web typecheck      # next typegen rồi tsc
pnpm --filter web lint           # oxlint (plugin nextjs, react, jsx-a11y)
```

Biến môi trường (`.env.local`, không bắt buộc khi chạy trên máy):

| Biến                  | Mặc định                | Dùng ở                       |
| --------------------- | ----------------------- | ---------------------------- |
| `API_URL`             | `http://localhost:4000` | Server Components            |
| `NEXT_PUBLIC_API_URL` | (chưa dùng)             | Client Components, công khai |

## Ghi chú cài đặt

- Tạo bằng `create-next-app@16.4.4` (template rỗng) ở thư mục tạm rồi chép vào, vì thư mục này đã có sẵn cây `src/`.
- Bỏ ESLint của template, dùng oxlint như các package khác.
- `transpilePackages: ["@xom-nho/ui"]` vì `ui` xuất thẳng file `.tsx`. `@xom-nho/api` đã build sẵn ra `dist/` nên không cần.
- Tailwind chạy bằng loader `@tailwindcss/turbopack` (mặc định của Next 16.4), không có `postcss.config`.
- Font Be Vietnam Pro và Lora nạp bằng `next/font/google` với subset `vietnamese`, đặt biến `--font-be-vietnam-pro`, `--font-lora` mà theme đọc.
- Cache Components đang bật: dữ liệu lấy lúc có request phải nằm trong `<Suspense>` (ví dụ `BackendStatus` ở trang chủ).
