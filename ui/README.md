# @xom-nho/ui

Design system Xóm Nhỏ: token thiết kế cho cả ba frontend, component React (shadcn/ui) cho web và admin. Chưa khởi tạo, xem giai đoạn 0 trong [docs/lo-trinh.md](../docs/lo-trinh.md).

## Khởi tạo

1. `package.json`:

   ```jsonc
   {
     "name": "@xom-nho/ui",
     "private": true,
     "type": "module",
     "exports": {
       "./tokens": "./src/tokens/index.ts",
       "./styles/theme.css": "./src/styles/theme.css",
       "./components/*": "./src/components/*.tsx",
       "./lib/utils": "./src/lib/utils.ts",
       "./hooks/*": "./src/hooks/*.ts",
     },
   }
   ```

   Không cần bước build: Next.js (`transpilePackages`), Vite và Metro đều đọc được TypeScript.

2. Chạy `pnpm dlx shadcn@latest init` trong thư mục này để tạo `components.json`, chỉnh đường dẫn về `src/components`, `src/lib/utils`.
3. Viết `src/tokens/*` và `src/styles/theme.css` theo bảng màu và font trong [docs/giong-van-va-giao-dien.md](../docs/giong-van-va-giao-dien.md).
4. Thêm các component đầu tiên: `button input label textarea select dialog alert-dialog dropdown-menu table badge card tabs sonner skeleton pagination avatar`.

Quy tắc: [CLAUDE.md](CLAUDE.md).
