# apps/mobile

Chưa khởi tạo. Xem giai đoạn 0 trong [docs/lo-trinh.md](../../docs/lo-trinh.md).

Tạo ở thư mục tạm rồi chép sang để giữ `CLAUDE.md` này:

```bash
cd apps
pnpm create expo-app@latest mobile-tmp --no-install
cp -r mobile-tmp/. mobile/
rm -rf mobile-tmp
```

Chọn template có Expo Router + TypeScript (mặc định của các bản gần đây). Sau đó:

- đặt `"name": "mobile"` trong `package.json`
- thêm `"@xom-nho/shared": "workspace:*"` vào dependencies
- dựng thư mục theo [CLAUDE.md](CLAUDE.md)

Expo trong monorepo pnpm: đọc mục "Work with monorepos" trong tài liệu Expo cho bản SDK đang dùng (cấu hình Metro, `node-linker`) nếu gặp lỗi không tìm thấy `@xom-nho/shared`.
