# Override: frontend/admin

Áp dụng cho trang quản trị. Quy tắc ở đây **ghi đè** `../MASTER.md`; mục nào không nhắc tới thì theo MASTER.

## Định hướng

| Mục           | Quyết định                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Loại màn hình | Dashboard / Data View: bảng dữ liệu, hàng chờ duyệt, biểu mẫu                                                             |
| Density       | **8/10** (dày): ưu tiên xem được nhiều dòng, quét nhanh                                                                   |
| Motion        | 2/10, như MASTER                                                                                                          |
| Màu           | Trung tính, chỉ dùng màu cho **trạng thái** (xanh lá / vàng / đỏ) và hành động chính. Không dùng màu danh mục làm nền lớn |
| Giọng văn     | Ngắn, trung tính; không dùng cách gọi "hàng xóm" trong thông báo hệ thống                                                 |

## Kính mờ (MASTER 2.4)

- Không dùng ảnh nền và khung kính lớn như web: bảng dày chữ nhỏ trên kính khó quét, và kính trong vùng cuộn dài tốn hiệu năng. Nền trang là `background`; bảng dữ liệu, thẻ số liệu, form dùng `Card` đặc (`bg-card`, `shadow-card`).
- Giữ chung với web: màu nhấn đen + xanh nhạt, nút và điều hướng dạng viên thuốc, `animate-rise-in` cho thẻ số liệu. Sidebar có thể là tấm tối (`dark` + `bg-card`).

## Khoảng cách (density 8)

Thang 8 đến 32 thay cho 16 đến 64 của MASTER:

| Token     | Giá trị | Dùng cho                                                  |
| --------- | ------- | --------------------------------------------------------- |
| `space-1` | 4px     | Khoảng giữa biểu tượng và chữ                             |
| `space-2` | 8px     | Padding ô bảng (dọc), khoảng giữa nút trong thanh công cụ |
| `space-3` | 12px    | Padding ô bảng (ngang), khoảng trong thẻ                  |
| `space-4` | 16px    | Khoảng giữa khối                                          |
| `space-6` | 24px    | Lề trang                                                  |
| `space-8` | 32px    | Khoảng giữa các vùng lớn                                  |

## Chữ

- Chữ giao diện `text-sm` (14/20) là mặc định trong bảng; tiêu đề trang `text-2xl`.
- Chỉ dùng **Be Vietnam Pro**. Lora chỉ xuất hiện khi xem trước nội dung bài.
- Số liệu trong bảng và thẻ thống kê dùng `font-variant-numeric: tabular-nums` để cột số thẳng hàng.

## Bố cục

- Sidebar trái 240px (thu gọn còn 64px chỉ biểu tượng, có tooltip và nhãn cho trình đọc màn hình) + topbar 56px + vùng nội dung.
- Nội dung rộng tối đa 1440px.
- Dưới 1024px: sidebar thành ngăn kéo mở bằng nút menu.

## Bảng dữ liệu

Theo kết quả `--stack shadcn` và gợi ý dashboard của skill:

- Dùng component `Table` với đủ `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell`; không dựng bảng bằng `div` lưới.
- Header bảng dính trên cùng khi cuộn.
- **Tránh bảng rộng làm vỡ bố cục**: bọc bảng trong vùng `overflow-x-auto` riêng (chỉ bảng cuộn ngang, trang thì không); cột ít quan trọng ẩn dưới 1280px.
- **Không chỉ có hành động từng dòng**: có checkbox chọn nhiều + thanh hành động hàng loạt (duyệt, ẩn, xóa nhiều mục) xuất hiện khi đã chọn, ghi rõ "Đã chọn 3 bài".
- Hành động mỗi dòng gom vào `DropdownMenu` (nút ba chấm có `aria-label="Thao tác"`), hành động hay dùng nhất (ví dụ "Duyệt") có thể để nút riêng.
- Trạng thái dùng badge theo bảng 2.3 của MASTER.
- Phân trang ở dưới bảng: tổng số, chọn số dòng/trang (20, 50, 100), trang trước/sau.
- Trống: "Không có bài nào khớp bộ lọc" + nút "Xóa bộ lọc".

## Hàng chờ duyệt

- Bố cục hai cột trên màn hình rộng: danh sách bài chờ (trái, 360px) + xem trước nội dung đầy đủ (phải) với nút "Duyệt" và "Từ chối" cố định ở đáy vùng xem trước.
- Phím tắt (có ghi chú trên giao diện): `J`/`K` chuyển bài, `A` duyệt, `R` mở hộp từ chối. Không kích hoạt khi đang gõ trong ô nhập.
- Từ chối bắt buộc nhập lý do; nút xác nhận bị khóa đến khi có lý do.

## Thẻ số liệu (dashboard)

- Thẻ `Card`: con số lớn (`text-3xl`, tabular-nums), nhãn `text-sm` `muted-foreground`, so với 7 ngày trước (mũi tên + phần trăm, kèm chữ "tăng"/"giảm", không chỉ dựa vào màu).
- Biểu đồ 30 ngày: đường đơn giản, có tooltip và nhãn trục; dùng màu `primary`; có bảng số liệu thay thế cho trình đọc màn hình.
- Ghi rõ thời điểm cập nhật số liệu ("Cập nhật lúc 14:05"); không gắn nhãn "trực tiếp" nếu không thật sự cập nhật thời gian thực.

## Hộp thoại xác nhận

- Tiêu đề nói rõ hành động ("Cấm tài khoản Nguyễn A?"), mô tả hậu quả, nút nguy hiểm màu `destructive` đặt bên phải, nút "Hủy" nhận focus mặc định.
- Sau khi xong: toast ngắn ("Đã cấm tài khoản"), có "Hoàn tác" nếu backend hỗ trợ.

## Checklist bổ sung

- [ ] Bảng dùng đúng cấu trúc semantic, header dính, cuộn ngang trong vùng riêng
- [ ] Có chọn nhiều + hành động hàng loạt cho bài và bình luận
- [ ] Bộ lọc và trang lưu trên URL
- [ ] Phím tắt không xung đột khi đang gõ; có chỗ hiển thị danh sách phím tắt
- [ ] Mọi hành động nguy hiểm có xác nhận, có lý do khi cần
