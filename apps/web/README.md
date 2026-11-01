# apps/web

Chưa khởi tạo. Xem giai đoạn 0 trong [docs/lo-trinh.md](../../docs/lo-trinh.md).

`create-next-app` không chịu tạo vào thư mục đã có file, nên tạo ở thư mục tạm rồi chép sang (giữ lại `CLAUDE.md` này):

```bash
cd apps
pnpm create next-app@latest web-tmp --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --disable-git --skip-install
cp -r web-tmp/. web/
rm -rf web-tmp
```

`README.md` mới của Next.js sẽ ghi đè file này, không sao. Sau đó:

- đặt `"name": "web"` trong `package.json`
- thêm `"@xom-nho/shared": "workspace:*"` vào dependencies
- dựng thư mục theo [docs/kien-truc.md](../../docs/kien-truc.md) và đọc [CLAUDE.md](CLAUDE.md)
