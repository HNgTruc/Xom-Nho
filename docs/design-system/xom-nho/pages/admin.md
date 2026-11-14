# Override: frontend/admin

Áp dụng cho trang quản trị. Quy tắc ở đây **ghi đè** `../MASTER.md`; mục nào không nhắc tới thì theo MASTER.

## Định hướng

| Mục           | Quyết định                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Loại màn hình | Dashboard / Data View: bảng dữ liệu, màn Bài mới (xem lần lượt), biểu mẫu                                                 |
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
- **Trong dòng bảng** (chốt 2026-11-13, ghi đè MASTER): badge chữ 12px, biểu tượng 14px, nút cao 32px. Admin dùng chuột trên máy tính nên bảng dày để thấy nhiều dòng. Ngoài bảng (thanh công cụ, hộp thoại, form) vẫn theo MASTER: nút tối thiểu 40px, badge 14px. Dưới 1024px (màn cảm ứng) nút trong dòng về lại 40px.
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
- **Không chỉ có hành động từng dòng**: có checkbox chọn nhiều + thanh hành động hàng loạt (ẩn, hiện lại, xóa nhiều mục) xuất hiện khi đã chọn, ghi rõ "Đã chọn 3 bài".
- Hành động mỗi dòng gom vào `DropdownMenu` (nút ba chấm có `aria-label="Thao tác"`), hành động hay dùng nhất (ví dụ "Ẩn") có thể để nút riêng.
- Trạng thái dùng badge theo bảng 2.3 của MASTER.
- Phân trang ở dưới bảng: tổng số, chọn số dòng/trang (20, 50, 100), trang trước/sau.
- Trống: "Không có bài nào khớp bộ lọc" + nút "Xóa bộ lọc".

## Bài mới

Thay cho "Hàng chờ duyệt" (chốt 2026-11-13): từ ADR 0008 bài đăng thẳng, không còn bài nào chờ duyệt. Trưởng xóm đọc lại các bài đã lên xóm và ẩn bài vi phạm.

- Xem lần lượt các bài đăng **từ lần xem trước**, bài cũ nhất trước. Số bài chưa xem hiện ở sidebar (mục "Bài mới").
- **Bài đã mở không biến mất** trong lúc đang xem: mờ đi (72%) kèm nhãn "Đã xem"; bài đã ẩn có nhãn "Đã ẩn". Quay lại được bằng `K`, vẫn ẩn được bài vừa đọc.
- **Mốc "lần xem trước" chỉ dời khi bấm "Đánh dấu đã xem hết"** (chốt 2026-11-13, cách chắc chắn: không bao giờ sót bài chưa đọc). Mở bài, chuyển bài không dời mốc. Lần mở trang sau, bộ lọc mặc định "Từ: Lần xem trước" không còn hiện các bài trước mốc; xem lại bằng "24 giờ qua", "7 ngày qua" hoặc màn Bài viết.
- Bố cục hai cột trên màn hình rộng: danh sách bài (trái, 360px) + xem trước nội dung đầy đủ (phải), có khung nhỏ thông tin tác giả (ngày tham gia, số bài, đã từng bị ẩn bài chưa). Nút "Ẩn bài" (nút viền) và "Bài tiếp theo" cố định ở đáy vùng xem trước.
- Phím tắt (có ghi chú trên giao diện): `J`/`K` chuyển bài, `H` mở hộp ẩn bài, `O` mở bài trên Xóm Nhỏ. Không kích hoạt khi đang gõ trong ô nhập.
- Hết bài: "Đã xem hết bài mới." kèm nút về Tổng quan.
- Đầu trang ghi "33 bài từ lần xem trước · đã mở 3" (cùng con số gốc với số trên sidebar), không trừ số đã mở: trừ đi thì hai chỗ lệch số, trông như lỗi.
- Bộ lọc "Lần xem trước / 24 giờ / 7 ngày" (nhãn ngắn để vừa điện thoại), giờ của mốc ghi riêng một dòng chữ phụ.
- Thanh "Ẩn bài / Bài tiếp theo" dính đáy vùng xem bài là `glass-bar` (có làm mờ, che chữ phía sau khi cuộn). Dưới 640px "Mở trên Xóm Nhỏ" chỉ còn biểu tượng.
- Dưới 1024px: danh sách trước, chọn bài thì sang xem bài, có nút "Danh sách bài" để quay lại.
- Bài cũ dạng Markdown hiện nguyên văn (có ký tự `##`, `**`): admin chưa có bộ hiển thị Markdown; hiện nguyên văn an toàn và đúng những gì tác giả gõ.

## Ẩn bài

- **Bắt buộc lý do, tác giả thấy được** (chốt 2026-11-13). Hộp ẩn bài có chọn nhanh: "Quảng cáo, rao vặt", "Lời lẽ xúc phạm", "Lộ thông tin cá nhân", "Lý do khác" (kèm ô ghi thêm, bắt buộc khi chọn mục này). Nút "Ẩn bài" khóa đến khi có lý do.
- Backend: `POST /admin/posts/:id/archive` nhận `{ reason }`, lưu vào cột `rejectReason` (không cần migration). Hiện lại (`restore`) thì xóa lý do.
- Phía tác giả (web, mobile): bài đã ẩn hiện lý do trong hộp màu `destructive` nhạt (MASTER mục 6, "dấu hiệu kiểm duyệt").

## Thống kê ở màn Bài viết

Chủ dự án chốt 2026-11-13. Backend đã có (`GET /admin/posts/stats`, `GET /admin/posts?range=&sort=&order=`), giao diện làm cùng màn Bài viết.

- **Khoảng thời gian** chọn được: 7 ngày, 30 ngày (mặc định), Tất cả. Áp cho cả thẻ số liệu lẫn bảng xếp hạng; tính theo bài **đăng** trong khoảng (tương tác cộng dồn tới hiện tại).
- **Thẻ số liệu**: số bài đăng trong khoảng, so với khoảng liền trước (mũi tên + "tăng"/"giảm", như mục "Thẻ số liệu"); "Tất cả" thì không so. Số trên các tab trạng thái lấy từ `byStatus`.
- **Bảng xếp hạng** 20 bài, chọn được 30: cột Thích, Không thích, Bình luận, Lượt xem **hiện riêng**, không gộp thành một con số; bấm tiêu đề cột để xếp theo cột đó (`aria-sort` trên `<th>`), mặc định cao xuống thấp, có nút đảo chiều. Trùng số thì bài mới hơn đứng trước.
- Số Không thích hiện như số khác (không tô đỏ): màu chỉ dành cho trạng thái và việc không đảo ngược được.
- Dưới 768px bảng xếp hạng chỉ còn tên bài và **cột đang xếp**; đổi cột bằng ô chọn "Xếp theo" dưới bảng (không có tiêu đề cột để bấm). Ẩn cố định một cột thì xếp theo đúng cột đó là mất số.
- Nhóm nút chọn một (khoảng thời gian, số bài) là `Segmented` (`aria-pressed`, nút cao 40px vì nằm ngoài dòng bảng), không dùng tab: đổi lựa chọn chỉ lọc lại dữ liệu bên dưới.

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
- [ ] Mọi hành động nguy hiểm có xác nhận, có lý do khi cần; ẩn bài luôn có lý do
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

Đề xuất đã chốt 2026-11-13 (chủ dự án duyệt cả ba):

- **Bỏ "Hàng chờ duyệt", thay bằng màn "Bài mới"**: xem mục "Bài mới" ở trên. Thẻ "Bài chờ duyệt" ở Tổng quan đổi thành "Đang ẩn".
- **Ẩn bài bắt buộc lý do, tác giả thấy được**: xem mục "Ẩn bài" ở trên.
- **Mật độ trong bảng** (badge 12px, biểu tượng 14px, nút trong dòng 32px): xem mục "Chữ" ở trên.

Mốc "lần xem trước" (chốt 2026-11-14): lưu `localStorage` của app admin, gửi lên `GET /admin/posts?since=`; mỗi máy một mốc, không cần migration. Chưa có mốc (máy mới) thì mặc định 24 giờ qua.
