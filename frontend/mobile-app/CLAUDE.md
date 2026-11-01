# frontend/mobile-app

App Expo (Expo Router, TypeScript), chạy thử bằng **Expo Go trên điện thoại thật** qua Wi-Fi. Có mọi tính năng của web **trừ quản trị**. Gọi `backend` qua `@xom-nho/shared/api-client`.

## Trước khi viết code

- Chỉ dùng thư viện có trong Expo SDK hoặc thuần JS (chạy được trên Expo Go). Thư viện cần native code riêng thì hỏi trước.
- Cài bằng `npx expo install <tên>`.
- Đọc tài liệu theo đúng phiên bản SDK trong `package.json`.

## Cấu trúc

```
app/                            CHỈ định tuyến (mỗi file là một màn hình)
├── _layout.tsx                 providers
├── (tabs)/
│   ├── _layout.tsx             4 tab: Trang chủ, Tìm kiếm, Viết, Cá nhân
│   ├── index.tsx
│   ├── tim-kiem.tsx
│   ├── viet-bai.tsx
│   └── ca-nhan.tsx
├── bai-viet/[slug].tsx
├── danh-muc/[slug].tsx
├── u/[username].tsx
└── (auth)/dang-nhap.tsx, dang-ky.tsx
src/
├── features/
│   ├── posts/                  components/, api/ (query hooks), hooks/
│   ├── comments/
│   ├── editor/
│   ├── auth/
│   ├── search/
│   └── profile/
├── components/                 Button, TextField, Screen, EmptyState... (viết bằng React Native, style từ theme)
├── hooks/
├── lib/
│   ├── api.ts                  api-client, baseUrl = EXPO_PUBLIC_API_URL
│   ├── auth-client.ts          Better Auth + plugin Expo + expo-secure-store
│   └── query-client.ts
└── theme/                      đọc token từ @xom-nho/ui/tokens, export màu, cỡ chữ, khoảng cách
assets/                         icon, splash, font
```

File trong `app/` chỉ lấy tham số route và render component từ `src/features/`.

## Quy ước

- Màu, cỡ chữ, khoảng cách **chỉ lấy từ `src/theme`** (gốc là `@xom-nho/ui/tokens`), để app và web luôn cùng một bộ màu. **Không import component từ `@xom-nho/ui`** (đó là component web).
- Dữ liệu server: TanStack Query; danh sách dài: `FlatList` có `onEndReached` + `RefreshControl`.
- Màn hình nào cũng xử lý đủ: đang tải, lỗi (nút thử lại), trống, có dữ liệu.
- `SafeAreaView`, `KeyboardAvoidingView` cho form; vùng chạm ≥ 44; `accessibilityLabel` tiếng Việt cho nút biểu tượng.
- Phiên đăng nhập lưu bằng `expo-secure-store`, không AsyncStorage.

## Lỗi mạng hay gặp

"Network request failed" gần như luôn do: sai IP trong `EXPO_PUBLIC_API_URL`, backend chưa lắng nghe `0.0.0.0`, tường lửa Windows chặn cổng 4000, hoặc điện thoại khác Wi-Fi. Xem `docs/thiet-lap-moi-truong.md`.

## Lệnh

```bash
pnpm --filter mobile-app start
pnpm --filter mobile-app start -- --tunnel
```
