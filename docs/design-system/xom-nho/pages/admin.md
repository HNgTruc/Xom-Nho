# Override: frontend/admin

Áp dụng cho trang quản trị. Quy tắc ở đây **ghi đè** `../MASTER.md`; mục nào không nhắc tới thì theo MASTER.

## Định hướng

| Mục           | Quyết định                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Loại màn hình | Dashboard / Data View: bảng dữ liệu, hàng chờ duyệt, biểu mẫu                                                             |
| Density       | **8/10** (dày): ưu tiên xem được nhiều dòng, quét nhanh                                                                   |
| Motion        | 5/10, như MASTER; biểu đồ và thẻ số liệu có chuyển động (mục "Thẻ số liệu")                                               |
| Màu           | Trung tính, chỉ dùng màu cho **trạng thái** (xanh lá / vàng / đỏ) và hành động chính. Không dùng màu danh mục làm nền lớn |
| Giọng văn     | Ngắn, trung tính; không dùng cách gọi "hàng xóm" trong thông báo hệ thống                                                 |

## Kính mờ (MASTER 2.4)

Đổi 2026-11-13 theo chủ dự án: admin dùng **kính mờ trên ảnh nền biển như web** (trước đó dùng `Card` đặc trên `background`).

- Ảnh nền, khung lớn `glass-shell` (cách mép 12px, bo `radius-2xl`) giống web; ảnh làm mờ sẵn 6px, chế độ tối giảm sáng 25%.
- Sidebar và topbar là tấm `glass` (75%): sidebar bo `radius-xl`, topbar dạng viên thuốc. Mục đang chọn là viên `glass-primary`, nút viền là `glass-button`.
- **Bảng dữ liệu, form, khung xem trước bài đặt trên `glass-strong` (85%)**, không đặt trên `glass`: chữ 12 đến 14px dày đặc trên kính trong khó quét. Thẻ số liệu cũng dùng `glass-strong`.
- Chỉ hộp thoại và toast dùng `backdrop-filter` (như `glass-bar`); bảng cuộn dài không tự làm mờ (MASTER 2.4).
- Tắt trong suốt (`prefers-reduced-transparency`, hoặc tùy chọn trong menu tài khoản) thì về bản đặc: nền `background`, tấm `card`, `shadow-card`.

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
- Thẻ số liệu có chuyển động: số đếm từ 0 lên (khoảng 800ms, chậm dần), cột nhỏ 7 ngày mọc lên lần lượt (cột hôm nay `primary`, còn lại `primary` 42%); thẻ "Đang ẩn" có thanh chia bài/bình luận chạy ngang.
- Biểu đồ 30 ngày là **biểu đồ cột** (đổi từ đường, 2026-11-13): cột mọc từ đáy lần lượt (`scaleY`, 520ms, trễ 10ms mỗi cột), đổi số liệu (Bài viết / Bình luận / Thành viên) thì chạy lại. 7 ngày gần nhất màu `primary`, 23 ngày trước `primary` 42%, có chú thích. Rê chuột vào cột hiện số của cột; cột hôm nay luôn hiện số. Có nhãn trục và nút "Xem bảng số liệu" thay thế cho trình đọc màn hình.
- Chuyển động chỉ dùng `transform`, `opacity`; tắt hết khi `prefers-reduced-motion` (số hiện ngay giá trị cuối).
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
- [ ] Bảng, form nằm trên `glass-strong`; tắt trong suốt vẫn đọc được (bản đặc)
- [ ] Biểu đồ, thẻ số liệu tắt chuyển động khi `prefers-reduced-motion`

## Bản thiết kế tham khảo (giai đoạn 5)

Bản demo bấm thử được (riêng tư trong tài khoản claude.ai của chủ dự án): <https://claude.ai/artifact/2mKLCtNCbpXgtvLXModjH1>. Gồm Tổng quan, Bài mới, Bài viết, Thành viên (chế độ tối, hộp cấm), Danh mục, Trạng thái và thành phần; mỗi màn có Tweaks bật/tắt chế độ tối và kính. Khi code lệch với bản demo thì file này và MASTER thắng.

Quyết định rút ra từ bản demo (2026-11-13), áp dụng khi làm giai đoạn 5:

- **Layout**: sidebar 240px gồm viên logo (biểu trưng `xn`, chữ "Xóm Nhỏ", viên "Quản trị"), nhóm điều hướng có nhãn chữ thường 12px (không viết hoa: chữ có dấu viết hoa đọc nặng): Tổng quan; Kiểm duyệt (Bài mới, Bài viết, Bình luận); Nội dung (Danh mục, Thẻ); Cộng đồng (Thành viên). Cuối sidebar: Mở Xóm Nhỏ, Đăng xuất. Topbar: nút thu gọn sidebar, ô tìm (phím `/`), nút chế độ tối, menu tài khoản.
- **Số đếm ở sidebar** (bài chưa xem) là viên `accent`, có `aria-label` đọc kèm số.
- **Màu chỉ cho trạng thái và việc không đảo ngược được**: nút "Ẩn bài" là nút viền thường (ẩn hiện lại được); đỏ `destructive` chỉ cho Xóa, Cấm. Mũi tên tăng/giảm ở thẻ số liệu không tô xanh/đỏ (nhiều bình luận chưa hẳn là tốt), có chữ "tăng"/"giảm".
- **Vai trò**: Trưởng xóm viên `primary`, Cây bút viên `accent`, Hàng xóm viên `muted`. Avatar người khác nền `muted` (như mobile), avatar của mình nền `accent`.
- **Bảng Bài viết**: chọn nhiều thì thanh "Đã chọn N bài" (viên `primary`: Ẩn, Hiện lại, Xóa…) **thay chỗ** thanh lọc cùng chiều cao, bảng không bị xô; dòng đã chọn nền `accent` 28%. Bài không tiêu đề (ADR 0008) hiện phần đầu nội dung, chữ thường 400; bài có tiêu đề đậm 600. Bài đang ẩn mờ 60%.
- **Thành viên**: hàng của chính mình khóa nút đổi vai trò, cấm (có `title` giải thích). Hộp cấm: thời hạn (1 ngày, 7 ngày, 30 ngày, Vĩnh viễn, ghi rõ giờ hết hạn), lý do bắt buộc, nút "Cấm tài khoản" khóa đến khi có lý do.
- **Danh mục**: danh sách theo thứ tự menu Chủ đề, có tay cầm kéo và thanh số bài; khung sửa có ô màu (5 màu, tên màu bằng chữ), ô biểu tượng (5 + "không có" hiện chấm màu), xem trước đầu trang danh mục, mục menu Chủ đề và badge cùng lúc. Xóa danh mục khóa khi còn bài, ghi rõ còn bao nhiêu bài.

Đề xuất chưa chốt (cần chủ dự án duyệt trước khi làm):

- **Bỏ "Hàng chờ duyệt", thay bằng màn "Bài mới"** (bản demo đã vẽ theo hướng này): từ ADR 0008 bài đăng thẳng, không còn gì chờ duyệt. Màn "Bài mới" xem lần lượt bài từ lần xem trước (danh sách 360px + xem trước, phím `J`/`K`/`H`/`O`), khung nhỏ thông tin tác giả (ngày tham gia, số bài, đã bị ẩn bài chưa), nút "Ẩn bài" và "Bài tiếp theo". Thẻ "Bài chờ duyệt" ở Tổng quan đổi thành "Đang ẩn". Nếu duyệt thì sửa mục "Hàng chờ duyệt" ở trên, `tinh-nang.md` 4.1, 4.2 và `api.md` (`/admin/dashboard`).
- **Ẩn bài bắt buộc lý do, tác giả thấy được** (chọn nhanh: Quảng cáo, rao vặt; Lời lẽ xúc phạm; Lộ thông tin cá nhân; Lý do khác + ô ghi thêm). Cần `POST /admin/posts/:id/archive` nhận `{ reason }`, có thể dùng lại cột `rejectReason`.
- **Mật độ trong bảng**: badge chữ 12px, biểu tượng 14px; nút trong dòng bảng cao 32px (MASTER: badge 14px, nút tối thiểu 40px). Hợp lý cho máy tính dùng chuột, nhưng trái MASTER nên cần duyệt.
