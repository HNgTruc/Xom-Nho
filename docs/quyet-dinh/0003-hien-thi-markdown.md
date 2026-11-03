# 0003. Hiển thị Markdown an toàn trên web

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-03

## Bối cảnh

Bài viết lưu dạng Markdown thô ([0001](0001-chon-cong-nghe.md)); backend trả nguyên `content`, frontend tự hiển thị. Ràng buộc:

- Không chạy được script chèn trong bài; cấm `dangerouslySetInnerHTML` với nội dung người dùng (`CLAUDE.md`).
- Liên kết `javascript:` bị chặn; liên kết ngoài có `rel="nofollow ugc noopener"` (`.claude/rules/bao-mat.md`).
- Bài dài có mục lục tự động, nên tiêu đề cần `id` ổn định.
- Trình soạn (giai đoạn 4) xem trước bằng đúng component dùng để hiển thị bài.

## Quyết định

| Thư viện          | Vai trò                                                               |
| ----------------- | --------------------------------------------------------------------- |
| `react-markdown`  | Dựng Markdown thành phần tử React. Mặc định bỏ qua HTML thô trong bài |
| `remark-gfm`      | Bảng, danh sách việc, gạch ngang chữ, tự nhận liên kết                |
| `rehype-sanitize` | Lớp chặn thứ hai: chỉ giữ thẻ và thuộc tính trong danh sách cho phép  |
| `rehype-slug`     | Gắn `id` cho tiêu đề để làm mục lục và liên kết tới từng mục          |

Chỉ cài cho `frontend/web`, khi làm trang chi tiết bài (giai đoạn 3). Component nằm ở `frontend/web/src/lib/markdown.tsx` (theo `frontend/web/CLAUDE.md`); liên kết và ảnh được viết lại qua prop `components`.

Đã cân nhắc:

- **Render HTML ở backend** (`marked` + `sanitize-html`) rồi gửi HTML: phải dùng `dangerouslySetInnerHTML`, trái quy tắc; app điện thoại không dùng được HTML.
- **`marked` + `DOMPurify` ở web**: cũng cần `dangerouslySetInnerHTML`; DOMPurify cần DOM, chạy trong Server Components phải thêm `jsdom`.
- **MDX**: cho phép chạy code trong bài, quá rộng với nội dung người dùng.

## Hệ quả

- Không có chuỗi HTML nào đi vào DOM: React tự thoát ký tự, `rehype-sanitize` là lớp phòng thủ thứ hai.
- Chạy được trong Server Components, nên bài viết có sẵn trong HTML trả về (tốt cho SEO).
- Thêm 4 gói vào web; kiểm tra kích thước bundle khi rà soát hiệu năng (giai đoạn 7).
- App điện thoại cần thư viện riêng cho React Native (chọn ở giai đoạn 6). Cần giữ cùng quy tắc: bỏ HTML thô, chặn `javascript:`.
- Cần test: bài có `<script>`, `<img onerror>`, liên kết `javascript:` hiển thị ra chữ vô hại.
