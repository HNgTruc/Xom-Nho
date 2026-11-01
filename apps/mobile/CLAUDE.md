# apps/mobile

App Expo (Expo Router, TypeScript). Chạy thử bằng **Expo Go trên điện thoại thật** qua Wi-Fi.

## Trước khi viết code

- Chỉ dùng thư viện có trong Expo SDK hoặc tương thích Expo Go. Thư viện cần native code riêng sẽ không chạy trên Expo Go; hỏi trước khi thêm.
- Cài thư viện bằng `npx expo install <tên>` (chọn đúng bản hợp với SDK), không dùng `pnpm add` trực tiếp.
- Đọc tài liệu theo đúng phiên bản SDK trong `package.json`.

## Phạm vi

Có mọi tính năng của web **trừ trang quản trị**: đọc, tìm, viết bài, bình luận, đăng nhập, hồ sơ. Người dùng admin dùng app như cây bút bình thường.

## Cấu trúc

```
app/
├── _layout.tsx              provider: auth, query client, theme
├── (tabs)/
│   ├── _layout.tsx          4 tab: Trang chủ, Tìm kiếm, Viết, Cá nhân
│   ├── index.tsx
│   ├── tim-kiem.tsx
│   ├── viet-bai.tsx
│   └── ca-nhan.tsx
├── bai-viet/[slug].tsx
├── danh-muc/[slug].tsx
├── u/[username].tsx
└── (auth)/dang-nhap.tsx, dang-ky.tsx
components/
lib/
├── api/                     client gọi /api/v1, mỗi tài nguyên một file
├── auth-client.ts           Better Auth + plugin Expo, lưu phiên bằng expo-secure-store
└── theme.ts                 màu, cỡ chữ theo docs/giong-van-va-giao-dien.md
hooks/
```

## Quy ước

- Gọi API **chỉ qua `lib/api/`**, không `fetch` rải rác trong màn hình. Địa chỉ server lấy từ `process.env.EXPO_PUBLIC_API_URL`.
- Kiểu dữ liệu nhận về và schema form import từ `@xom-nho/shared`, không khai báo lại.
- Dữ liệu từ server: dùng TanStack Query (cache, kéo để làm mới, cuộn vô hạn bằng `useInfiniteQuery`).
- Danh sách dài dùng `FlatList` (hoặc `FlashList` nếu đã cài), không `ScrollView` + `map`.
- Màn hình nào cũng xử lý đủ 4 trạng thái: đang tải, lỗi (có nút thử lại), trống, có dữ liệu.
- Tôn trọng vùng an toàn (`SafeAreaView` / `useSafeAreaInsets`), bàn phím không che ô nhập (`KeyboardAvoidingView`).
- Chữ hiển thị lấy từ `@xom-nho/shared` (messages) để giống web.

## Lỗi mạng hay gặp

App báo "Network request failed" thì gần như luôn do: sai IP trong `EXPO_PUBLIC_API_URL`, web chưa chạy với `-H 0.0.0.0`, tường lửa Windows chặn cổng 3000, hoặc điện thoại khác mạng Wi-Fi. Xem `docs/thiet-lap-moi-truong.md` mục 5.

## Lệnh

```bash
pnpm --filter mobile start        # quét QR bằng Expo Go
pnpm --filter mobile start -- --tunnel   # khi cùng Wi-Fi mà vẫn không vào được
```
