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

Toàn bộ chữ hiển thị nên gom về một chỗ (`shared/src/constants/messages.ts`) để web, admin và app nói giống nhau.

## Giao diện

### Cảm giác

Ấm, gọn, dễ đọc lâu. Giống một quán nhỏ đầu ngõ hơn là một mạng xã hội ồn ào. Nội dung là chính, trang trí ít.

### Màu (gợi ý, chỉnh khi thiết kế)

| Vai trò     | Sáng                  | Tối       |
| ----------- | --------------------- | --------- |
| Nền         | `#FBF8F3` (giấy kem)  | `#1C1917` |
| Chữ chính   | `#292524`             | `#F5F5F4` |
| Chữ phụ     | `#78716C`             | `#A8A29E` |
| Màu chủ đạo | `#C2410C` (gạch nung) | `#FB923C` |
| Màu phụ     | `#15803D` (lá)        | `#4ADE80` |
| Viền        | `#E7E5E4`             | `#44403C` |

Định nghĩa thành biến CSS của shadcn/ui (`--background`, `--primary`...) trên web, và một file `theme.ts` trên app dùng cùng mã màu.

### Chữ

- Font có đủ dấu tiếng Việt: **Be Vietnam Pro** (giao diện) và **Lora** hoặc **Noto Serif** (nội dung bài, đọc lâu dễ chịu hơn).
- Cỡ chữ nội dung bài: 18px trên web, 17 trên app; độ cao dòng 1.7; bề ngang cột chữ tối đa khoảng 70 ký tự.

### Logo

Mái nhà nhỏ với bong bóng trò chuyện, hoặc vài mái nhà sát nhau. Một màu, dùng tốt ở cỡ 32px.

### Khả năng tiếp cận

- Tương phản chữ đạt WCAG AA.
- Mọi nút chỉ có biểu tượng phải có nhãn (`aria-label` trên web, `accessibilityLabel` trên app).
- Dùng được bằng bàn phím trên web; vùng chạm tối thiểu 44×44 trên app.
