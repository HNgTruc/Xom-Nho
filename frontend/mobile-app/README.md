# frontend/mobile-app

App điện thoại Xóm Nhỏ: Expo SDK 58, Expo Router, TanStack Query; màu, chữ, khoảng cách lấy từ `@xom-nho/ui/tokens` qua `src/theme`. Quy ước code: [CLAUDE.md](CLAUDE.md). Expo đổi nhiều giữa các SDK: đọc [AGENTS.md](AGENTS.md) trước khi viết code.

## Chạy

```bash
pnpm dev:mobile                       # backend + Metro, quét QR bằng Expo Go
pnpm --filter mobile-app start        # chỉ Metro, có phím tắt (r: tải lại, j: debugger)
pnpm --filter mobile-app start -- --tunnel
pnpm --filter mobile-app typecheck
pnpm --filter mobile-app test         # Vitest cho phần TS thuần (theme, api-url)
```

Không cần file `.env`: app tự lấy IP của máy chạy Metro, gọi backend ở cổng 4000 (`src/lib/api-url.ts`). Đoán sai IP thì đặt `EXPO_PUBLIC_API_URL` trong `.env`. Lỗi mạng và tường lửa: [docs/thiet-lap-moi-truong.md](../../docs/thiet-lap-moi-truong.md) mục 5.

## Ghi chú cài đặt

- Tạo bằng `create-expo-app@5.0.0 --template default` ở thư mục tạm, giữ nguyên bộ dependency khớp SDK 58 (`npx expo install --check` báo "up to date"), bỏ code mẫu.
- Route đặt ở `app/` (gốc), không phải `src/app/` như template, theo quy ước trong CLAUDE.md. Expo Router hỗ trợ cả hai.
- Monorepo pnpm: từ SDK 54 dùng được cách cài cô lập, từ SDK 52 Metro tự cấu hình. **Không cần** `metro.config.js`, không cần `node-linker=hoisted`.
- Chỉ một bản React Native trong repo; mobile dùng React `19.3.0` (bản Expo ghim), web/admin/ui dùng bản trong catalog. Không sao vì mobile chỉ import `@xom-nho/ui/tokens` (TS thuần), không import component web.
- Scheme `xomnho` (trùng `MOBILE_APP_SCHEME` trong `.env.example`), dùng cho deep link và đăng nhập OAuth ở giai đoạn 2.
- Icon, splash đang dùng ảnh mẫu của Expo; thay bằng logo ở giai đoạn 7.
- Chưa nạp font Be Vietnam Pro / Lora (`@expo-google-fonts/*`), làm khi dựng giao diện thật ở giai đoạn 6.
