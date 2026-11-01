# frontend/admin

Trang quản trị Xóm Nhỏ (React + Vite). Chưa khởi tạo, xem giai đoạn 0 trong [docs/lo-trinh.md](../../docs/lo-trinh.md).

## Khởi tạo

Chạy trong `frontend/`:

```bash
pnpm create vite@latest admin-tmp --template react-ts
cp -r admin-tmp/. admin/
rm -rf admin-tmp
```

Sau đó:

1. `package.json`: `"name": "admin"`, thêm `"@xom-nho/shared": "workspace:*"`, `"@xom-nho/ui": "workspace:*"`.
2. Cài: React Router, TanStack Query, TanStack Table, Tailwind CSS v4 (plugin Vite).
3. `vite.config.ts`: cổng `5173`, alias `@` → `src`.
4. Dựng thư mục theo [CLAUDE.md](CLAUDE.md).
