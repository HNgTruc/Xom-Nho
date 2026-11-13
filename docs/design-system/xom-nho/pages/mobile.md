# Override: frontend/mobile-app

Áp dụng cho app Expo. Quy tắc ở đây **ghi đè** `../MASTER.md`; mục nào không nhắc tới thì theo MASTER. Dựa trên `references/pro-rules.md` của skill ui-ux-pro-max (quy tắc cho giao diện app native) và kết quả `--stack react-native`.

## Token

- Màu, chữ, khoảng cách lấy từ `@xom-nho/ui/tokens` qua `src/theme`; tên token giống web.
- Đơn vị là point/dp (không phải px): khoảng cách theo nhịp 4/8 như MASTER.
- Chữ nội dung bài: Lora 17 / dòng 28. Chữ giao diện: Be Vietnam Pro 16 / 24.
- **Hỗ trợ chữ to của hệ thống (Dynamic Type / Font scale)**: không khóa `allowFontScaling`; bố cục phải chịu được cỡ chữ lớn nhất mà không cắt chữ (dùng `flexWrap`, không đặt chiều cao cố định cho khối chữ).

## Điều hướng

- Thanh tab dưới **4 tab** (giới hạn ≤ 5): Trang chủ, Tìm kiếm, Viết, Cá nhân. Mỗi tab có biểu tượng + nhãn chữ.
- **Thanh tab nổi** (chốt 2026-11-13): viên `glass-bar` bo `radius-full`, cách hai mép 12, cách đáy 20 (cộng `useSafeAreaInsets().bottom` nếu lớn hơn), cao 64, đệm 6, bóng `glass-shadow-hover`. Biểu tượng Lucide 22, nhãn 12/16 đậm 600. Danh sách cuộn có đệm đáy ≥ 100 để mục cuối không bị che.
- Tab đang chọn: một **viên `glass-primary` trượt** phủ cả ô (biểu tượng và nhãn), chữ và biểu tượng trong viên màu `primary-foreground`; tab khác màu `muted-foreground`. Có `accessibilityState={{ selected: true }}`.
- Chuyển động của thanh tab (chỉ `transform`, `opacity`; tắt hết khi bật Reduce Motion):
  - Chạm xuống một tab: viên trượt sang tab đó ngay (320ms, `cubic-bezier(0.2, 0, 0, 1)`), rồi mới chuyển màn hình.
  - Vào màn hình: viên nảy nhẹ (scale 0.72 → 1.04 → 1, 460ms).
  - Cuộn xuống quá 48 (mỗi lần lệch ≥ 6): thanh thu còn `scale(0.86)` neo đáy giữa, nhãn mờ hẳn, biểu tượng dời xuống giữa ô; header trượt lên ẩn (`translateY(-100%)`). Cuộn lên: hiện lại đủ. Nhãn chỉ tạm ẩn khi đang cuộn xuống, vẫn đọc được bằng trình đọc màn hình.
- Thanh chọn dạng viên trong màn hình (sắp xếp feed, Bài viết / Bản nháp ở hồ sơ) dùng cùng kiểu viên trượt; các ô bằng nhau (104, 112). Thanh lọc danh mục ở Tìm kiếm (chip dài ngắn khác nhau, cuộn ngang) giữ đổi màu tức thì, không trượt.
- Làm bằng `Animated` có sẵn của React Native (`useNativeDriver: true`), không cần thêm thư viện.
- Nút quay lại luôn đưa về đúng màn hình trước; hỗ trợ vuốt quay lại trên iOS, nút Back trên Android.
- Màn hình chi tiết bài mở được bằng deep link (`xomnho://bai-viet/<slug>`).

## Chạm và phản hồi

- Mọi phần tử bấm được dùng `Pressable` (không dùng `TouchableOpacity` cho code mới).
- Phản hồi khi nhấn trong 80 đến 150ms: Android `android_ripple`, iOS giảm opacity còn 0.7. **Không** đổi kích thước hay vị trí khi nhấn (tránh xô bố cục).
- Vùng chạm tối thiểu **44×44pt (iOS) / 48×48dp (Android)**; biểu tượng nhỏ thì mở rộng `hitSlop`.
- Khoảng cách giữa hai vùng chạm ≥ 8.
- Mỗi vùng chỉ một cử chỉ chính; không đặt vuốt ngang trong danh sách bài (tránh xung đột với vuốt quay lại).

## Bố cục

- Tôn trọng vùng an toàn: header, thanh tab, nút cố định ở đáy đều dùng `useSafeAreaInsets`.
- Danh sách có `contentInset`/padding đáy bằng chiều cao thanh tab để mục cuối không bị che.
- Lề ngang 16 (điện thoại), 24 (tablet); trên tablet giới hạn cột chữ bài viết khoảng 640 thay vì tràn hết chiều ngang.
- Nhịp khoảng cách theo cấp: 8 (trong thành phần), 16 (giữa thành phần), 24 và 32 (giữa khối).

## Danh sách

- `FlatList` với item bọc `React.memo`, `renderItem` không viết inline cả cây giao diện, có `keyExtractor`.
- Kéo để làm mới (`RefreshControl` màu `primary`), cuộn vô hạn với footer "Đang tải thêm…".
- Skeleton có cùng chiều cao với thẻ bài thật.

## Chế độ tối

- Theo cài đặt hệ thống (`useColorScheme`), dùng bộ màu "Tối" của MASTER.
- Kiểm tra tương phản riêng cho chế độ tối; viền và đường phân cách phải nhìn thấy ở cả hai chế độ.
- Lớp phủ sau bottom sheet / modal: đen 50% trên chế độ sáng, đen 60% trên chế độ tối.

## Bàn phím và form

- `KeyboardAvoidingView` (iOS `padding`) cho màn hình Viết bài và ô bình luận; `keyboardShouldPersistTaps="handled"`.
- Ô bình luận dính đáy màn hình chi tiết bài, nằm trên vùng an toàn.
- Đặt `returnKeyType`, `textContentType`/`autoComplete` cho email và mật khẩu.

## Checklist trước khi giao (từ pro-rules của skill)

- [ ] Thử ở màn hình 375 và khi xoay ngang
- [ ] Bật Reduce Motion và cỡ chữ lớn nhất của hệ thống: vẫn dùng được, không cắt chữ
- [ ] Kiểm tra riêng tương phản chế độ tối
- [ ] Mọi vùng chạm ≥ 44pt / 48dp, không có nội dung bị che bởi tai thỏ hay thanh điều hướng
- [ ] Không dùng emoji làm biểu tượng; một bộ biểu tượng (Lucide) cùng kiểu nét
- [ ] Phản hồi khi nhấn rõ ràng, không xô bố cục
- [ ] Trạng thái vô hiệu rõ ràng và thật sự không bấm được
- [ ] Thứ tự focus của trình đọc màn hình khớp thứ tự hiển thị; nhãn mô tả rõ
- [ ] Không có xung đột cử chỉ (chạm/kéo/vuốt quay lại)

## Bản thiết kế tham khảo (giai đoạn 6)

Bản demo bấm thử được (riêng tư trong tài khoản claude.ai của chủ dự án): <https://claude.ai/artifact/LJPrv7UVt6DaQcanfRvMBd>. Gồm Đăng nhập, Trang chủ, Bài viết, Viết bài, Tìm kiếm, Cá nhân, hai màn chế độ tối và component thanh tab; mỗi màn có Tweaks bật/tắt chế độ tối và kính mờ. Khi code lệch với bản demo thì file này và MASTER thắng.

Quyết định rút ra từ bản demo (2026-11-13), áp dụng khi làm giai đoạn 6:

- **Ô tạo bài ở Trang chủ gọn một hàng**: viên "Chào {tên}, hôm nay có chuyện gì?" và nút tròn 44 "Đăng ảnh hoặc video" (cả hai mở màn Viết). Không có avatar và hàng Ảnh/Video riêng như web, vì đã có tab Viết và màn hẹp.
- **Avatar người khác nền `muted`, chữ `foreground`**; chỉ avatar của chính mình nền `accent`. Không tô avatar bằng màu danh mục: màu danh mục chỉ mang một nghĩa.
- **Vùng chạm 44 cho mọi thứ bấm được**, kể cả nút Thích, Trả lời / Sửa / Xóa, chip danh mục, viên tab sắp xếp, "Quên mật khẩu?". Viên số bình luận nhìn cao 28 nhưng vùng bấm 44. Nút gỡ ảnh 32 và chip thẻ (tag) 32 dùng `hitSlop` cho đủ 44.
- **Hàng hành động của thẻ bài**: nút Thích (biểu tượng tim, tô `rose` khi đã thích, `accessibilityState={{ selected }}`) bên trái, viên số bình luận `accent` bên phải; dưới là tối đa 2 bình luận xem trước trên nền `muted`.
- **Ảnh bìa hồ sơ** giảm sáng 25% ở chế độ tối như ảnh nền.
- Chữ nhỏ nhất 12 ở mọi chỗ, kể cả chữ cái trong avatar.

Đề xuất chưa chốt (cần chủ dự án duyệt trước khi làm):

- Thẻ bài đưa tác giả lên đầu (avatar, tên, giờ, badge danh mục) rồi mới tới nội dung, vì từ ADR 0008 nhiều bài không có tiêu đề.
- Bỏ viền quanh viên logo ở header mobile để bớt nhiễu.

## Kính mờ (MASTER 2.4)

- Màu nhấn đen + xanh nhạt và bảng màu trung tính lạnh áp dụng ngay vì app đọc chung `@xom-nho/ui/tokens`; nút, tab dạng viên thuốc theo MASTER 7. Ảnh nền biển chưa dùng trên app.
- Chưa làm mờ phía sau: cần thư viện `expo-blur`, chưa thêm (CLAUDE.md: hỏi trước khi thêm thư viện). Trong lúc chờ, thẻ và thanh tab dùng `card` đặc; token `glass` trong `@xom-nho/ui/tokens` có sẵn khi bật.
- Khi thêm `expo-blur`: chỉ dùng cho thanh tab dưới và header, không cho từng thẻ trong danh sách cuộn (tốn pin, giật trên Android); tôn trọng "Reduce Transparency" của iOS qua `AccessibilityInfo.isReduceTransparencyEnabled()`.
