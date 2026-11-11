# Giọng văn và giao diện

## Giọng văn

Xóm Nhỏ nói chuyện như một người hàng xóm dễ mến: thân thiện, ngắn gọn, không màu mè, không cợt nhả.

- Xưng hô: gọi người dùng là **bạn**. Chỉ dùng "hàng xóm" ở vài chỗ tạo không khí (lời chào, trang trống), không lạm dụng.
- Câu ngắn, động từ rõ: "Đăng bài", "Lưu nháp", "Gửi bình luận". Không viết "Tiến hành đăng bài".
- Lỗi: nói chuyện gì xảy ra và làm gì tiếp. "Mật khẩu chưa đúng. Thử lại hoặc đặt lại mật khẩu." Không đổ lỗi, không dùng mã lỗi kỹ thuật.
- Không dùng tiếng Anh khi đã có từ tiếng Việt quen thuộc (dùng "Đăng nhập", không dùng "Login").

### Từ vựng thống nhất

| Dùng           | Không dùng             |
| -------------- | ---------------------- |
| Bài viết       | Post, bài đăng         |
| Bình luận      | Comment, phản hồi      |
| Trả lời        | Reply                  |
| Danh mục       | Chuyên mục, category   |
| Thẻ (tag)      | Hashtag                |
| Bản nháp       | Draft                  |
| Chờ duyệt      | Pending, đang chờ      |
| Trang quản trị | Admin panel, dashboard |

Tên vai trò hiển thị: Hàng xóm, Cây bút, Trưởng xóm.

### Câu mẫu

| Chỗ                               | Câu                                                       |
| --------------------------------- | --------------------------------------------------------- |
| Lời chào trang chủ (đã đăng nhập) | Chào {tên}, hôm nay xóm có gì mới nè.                     |
| Lời chào (khách)                  | Ghé chơi Xóm Nhỏ. Đăng nhập để cùng trò chuyện.           |
| Trang chủ trống                   | Xóm còn vắng quá. Bạn mở hàng bài đầu tiên nhé?           |
| Bài chưa có bình luận             | Chưa ai lên tiếng. Bạn nói gì đi!                         |
| Tìm không ra                      | Không thấy bài nào khớp "{từ khóa}". Thử từ khác xem sao. |
| Gửi bài, chờ duyệt                | Đã gửi! Trưởng xóm sẽ xem và duyệt sớm.                   |
| Đăng thành công                   | Bài của bạn đã lên xóm.                                   |
| Bị từ chối                        | Bài chưa được duyệt. Lý do: {lý do}                       |
| 404                               | Lạc đường rồi. Trang này không có trong xóm.              |
| Lỗi máy chủ                       | Có trục trặc bên mình. Bạn thử lại sau ít phút nhé.       |
| Bị giới hạn tần suất              | Từ từ thôi bạn ơi, chờ vài giây rồi gửi tiếp.             |

Toàn bộ chữ hiển thị nên gom về một chỗ (`api/src/constants/messages.ts`) để web, admin và app nói giống nhau.

## Giao diện

Toàn bộ quyết định giao diện (màu, chữ, khoảng cách, chuyển động, biểu tượng, thành phần, checklist) nằm ở **[docs/design-system/xom-nho/MASTER.md](design-system/xom-nho/MASTER.md)**, lập bằng skill ui-ux-pro-max, mọi cặp màu đã tính tương phản WCAG. Quy tắc riêng:

- Trang quản trị: [docs/design-system/xom-nho/pages/admin.md](design-system/xom-nho/pages/admin.md)
- App điện thoại: [docs/design-system/xom-nho/pages/mobile.md](design-system/xom-nho/pages/mobile.md)

Tóm tắt nhanh:

- Phong cách Minimalism & Swiss, pattern Feed + Thread View, ấm và thân thiện.
- Nhấn **đen** `#18181B` cho hành động chính (tối: trắng `#FAFAFA`) và **xanh nhạt** `#BAE6FD` cho điểm nhấn nhỏ (tối: `#7DD3FC`); nền là ảnh biển nhìn qua khung kính mờ; mỗi danh mục một màu riêng. Chi tiết: MASTER mục 2.
- Font Be Vietnam Pro (giao diện) + Lora (nội dung bài), cả hai có đủ dấu tiếng Việt.
- Biểu tượng Lucide, không dùng emoji làm biểu tượng.

### Logo

Mái nhà nhỏ với bong bóng trò chuyện, hoặc vài mái nhà sát nhau. Một màu (`primary`), dùng tốt ở cỡ 32px, có bản cho nền tối.
