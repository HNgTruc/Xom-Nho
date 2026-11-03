---
paths:
  - "frontend/mobile-app/**"
---

# Quy tắc frontend/mobile-app (Expo)

- App chạy bằng **Expo Go**: chỉ dùng module có trong Expo SDK hoặc thuần JS. Module cần native code riêng thì hỏi trước.
- Cài thư viện bằng `npx expo install`.
- `app/` chỉ định tuyến (mọi file trong đó thành màn hình); giao diện và logic đặt trong `src/features/<tính-năng>/`, component dùng chung trong `src/components/`.
- Gọi backend qua `@xom-nho/shared/api-client` cấu hình ở `src/lib/api.ts`, `baseUrl = process.env.EXPO_PUBLIC_API_URL`. Không viết cứng `localhost`.
- Màu, cỡ chữ, khoảng cách chỉ lấy từ `src/theme` (gốc là `@xom-nho/ui/tokens`). **Không import `@xom-nho/ui/components`** (đó là component web, không chạy trên React Native).
- App đã cài không tự cập nhật theo backend: bỏ qua trường lạ, enum lạ (`status`, `role`, `sort`...) có nhánh mặc định, không crash. Xem "Quy tắc thay đổi API v1" trong `docs/api.md`.
- Dữ liệu server: TanStack Query. Danh sách: `FlatList` có `keyExtractor`, `onEndReached`, `RefreshControl`, `ListEmptyComponent`.
- Mỗi màn hình có đủ: đang tải / lỗi (nút thử lại) / trống / có dữ liệu.
- Vùng chạm ≥ 44; nút biểu tượng có `accessibilityLabel` tiếng Việt; form dùng `KeyboardAvoidingView`.
- Phiên đăng nhập bằng `expo-secure-store` qua plugin Expo của Better Auth.
- Không có tính năng quản trị trên app.
