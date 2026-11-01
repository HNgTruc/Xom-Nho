---
name: man-hinh-mobile
description: Tạo màn hình mới cho frontend/mobile-app (Expo Router + TanStack Query + shared api-client) của Xóm Nhỏ, đủ trạng thái tải, lỗi, trống, dữ liệu, dùng theme từ ui tokens. Dùng khi làm hoặc sửa bất kỳ màn hình nào của app điện thoại.
---

# Tạo màn hình mobile

## Trước khi làm

- Màn hình tương ứng trên web có chưa? Có thì giữ cùng nội dung và chữ.
- API cần dùng đã có trong `shared/src/api-client/` chưa? Chưa thì làm backend trước (skill `tao-module-backend`).
- Đọc tài liệu Expo Router theo SDK đang dùng nếu cần route động, tab, modal.

## Các bước

1. **Route** trong `app/` (ví dụ `app/bai-viet/[slug].tsx`): chỉ lấy tham số, đặt tiêu đề `Stack.Screen options={{ title }}` tiếng Việt, render màn hình từ `src/features/`.
2. **Query hook** trong `src/features/<tính-năng>/api/`: `useQuery` / `useInfiniteQuery` / `useMutation` gọi `api.<tài-nguyên>.<hàm>` (client từ `src/lib/api.ts`). Query key rõ ràng; sau mutation thì invalidate.
3. **Giao diện** trong `src/features/<tính-năng>/components/`, đủ 4 trạng thái:
   - Đang tải: skeleton hoặc `ActivityIndicator`
   - Lỗi: câu tiếng Việt + nút "Thử lại"
   - Trống: câu thân thiện theo `docs/giong-van-va-giao-dien.md`
   - Có dữ liệu
4. **Style**: màu, cỡ chữ, khoảng cách từ `src/theme` (gốc `@xom-nho/ui/tokens`). Không mã màu cứng, không import component web.
5. **Danh sách**: `FlatList` với `keyExtractor`, `onEndReached` + `onEndReachedThreshold`, `RefreshControl`, `ListEmptyComponent`, `ListFooterComponent`.
6. **Form**: kiểm tra bằng schema Zod từ `@xom-nho/shared`, lỗi dưới từng ô, nút gửi bị khóa khi đang gửi, `KeyboardAvoidingView`.
7. **Cần đăng nhập**: chưa có phiên thì hiện lời mời đăng nhập + nút sang màn hình đăng nhập, không để lỗi 401 lộ ra.
8. **Tiếp cận**: `accessibilityLabel`, `accessibilityRole`, vùng chạm ≥ 44.

## Hoàn tất

- Thử trên Expo Go: kéo làm mới, cuộn hết danh sách, tắt Wi-Fi để xem lỗi.
- `pnpm --filter mobile-app typecheck`.
- Báo người dùng cách mở màn hình để thử.
