# frontend/web

Trang web Xóm Nhỏ (Next.js). Chưa khởi tạo, xem giai đoạn 0 trong [docs/lo-trinh.md](../../docs/lo-trinh.md).

## Khởi tạo

`create-next-app` cần thư mục trống, nên tạo ở thư mục tạm rồi chép vào (chạy trong `frontend/`):

```bash
pnpm create next-app@latest web-tmp --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --disable-git --skip-install
cp -r web-tmp/. web/
rm -rf web-tmp
```

Sau đó:

1. `package.json`: `"name": "web"`, thêm `"@xom-nho/shared": "workspace:*"` và `"@xom-nho/ui": "workspace:*"`.
2. `next.config.ts`: thêm `transpilePackages: ["@xom-nho/shared", "@xom-nho/ui"]`.
3. `src/styles/globals.css`: import theme từ `@xom-nho/ui`.
4. Xóa trang mẫu, dựng thư mục theo [CLAUDE.md](CLAUDE.md).
