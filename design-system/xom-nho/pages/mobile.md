# Override: frontend/mobile-app

Áp dụng cho app Expo. Quy tắc ở đây **ghi đè** `../MASTER.md`; mục nào không nhắc tới thì theo MASTER. Dựa trên `references/pro-rules.md` của skill ui-ux-pro-max (quy tắc cho giao diện app native) và kết quả `--stack react-native`.

## Token

- Màu, chữ, khoảng cách lấy từ `@xom-nho/ui/tokens` qua `src/theme`; tên token giống web.
- Đơn vị là point/dp (không phải px): khoảng cách theo nhịp 4/8 như MASTER.
- Chữ nội dung bài: Lora 17 / dòng 28. Chữ giao diện: Be Vietnam Pro 16 / 24.
- **Hỗ trợ chữ to của hệ thống (Dynamic Type / Font scale)**: không khóa `allowFontScaling`; bố cục phải chịu được cỡ chữ lớn nhất mà không cắt chữ (dùng `flexWrap`, không đặt chiều cao cố định cho khối chữ).

## Điều hướng

- Thanh tab dưới **4 tab** (giới hạn ≤ 5): Trang chủ, Tìm kiếm, Viết, Cá nhân. Mỗi tab có biểu tượng + nhãn chữ.
- Tab đang chọn: biểu tượng và nhãn màu `primary`, có `accessibilityState={{ selected: true }}`.
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
