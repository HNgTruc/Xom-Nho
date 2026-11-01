# frontend/mobile-app

App điện thoại Xóm Nhỏ (Expo). Chưa khởi tạo, xem giai đoạn 0 trong [docs/lo-trinh.md](../../docs/lo-trinh.md).

## Khởi tạo

Chạy trong `frontend/`:

```bash
pnpm create expo-app@latest mobile-app-tmp --no-install
cp -r mobile-app-tmp/. mobile-app/
rm -rf mobile-app-tmp
```

Chọn template có Expo Router + TypeScript. Sau đó:

1. `package.json`: `"name": "mobile-app"`, thêm `"@xom-nho/shared": "workspace:*"`, `"@xom-nho/ui": "workspace:*"` (chỉ dùng phần `tokens`).
2. Chuyển code mẫu ngoài `app/` vào `src/` theo [CLAUDE.md](CLAUDE.md).
3. Expo trong monorepo pnpm: đọc mục "Work with monorepos" trong tài liệu Expo cho bản SDK đang dùng (Metro, `node-linker`) nếu không tìm thấy package `@xom-nho/*`.
