# Design System: Xóm Nhỏ (MASTER)

Nguồn sự thật cho mọi quyết định giao diện của web, admin và mobile-app. File override trong `pages/` (nếu có) được ưu tiên hơn file này cho trang/ứng dụng tương ứng.

- Token trong code: `ui/src/tokens/*` (TS) và `ui/src/styles/theme.css` (CSS). Hai nơi đó phải khớp file này.
- Lập bằng skill **ui-ux-pro-max** (xem mục "Nguồn và điều chỉnh" cuối file), ngày 2026-11-01.

## 1. Định hướng

| Mục            | Quyết định                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Loại sản phẩm  | Forum / Discussion Board                                                                         |
| Phong cách     | Minimalism & Swiss Style: sạch, nhiều khoảng trắng, phân cấp chữ rõ, lưới đều                    |
| Pattern        | Feed (danh sách bài) + Thread View (bài + bình luận)                                             |
| Chiến lược màu | Ấm, thân thiện; nền giấy kem; màu riêng cho từng danh mục; trạng thái bài luôn nhìn thấy         |
| Chế độ         | Sáng và tối, cả hai đều phải đạt tương phản                                                      |
| Dial           | Variance 3/10 (tối giản, căn giữa) · Motion 2/10 (rất nhẹ) · Density 5/10 (chuẩn) cho web/mobile |
| Cảm giác       | Một quán nhỏ đầu ngõ: nội dung là chính, trang trí ít, đọc lâu không mỏi                         |

## 2. Màu

Mọi cặp chữ/nền dưới đây đã tính tương phản theo WCAG 2.x.

### 2.1 Màu nền tảng

| Token                    | Sáng      | Tối       | Dùng cho                                     | Tương phản                                       |
| ------------------------ | --------- | --------- | -------------------------------------------- | ------------------------------------------------ |
| `background`             | `#FBF8F3` | `#1C1917` | Nền trang                                    |                                                  |
| `foreground`             | `#292524` | `#F5F5F4` | Chữ chính                                    | 14.3 / 16.0                                      |
| `card`                   | `#FFFFFF` | `#292524` | Thẻ bài, hộp thoại                           |                                                  |
| `card-foreground`        | `#292524` | `#F5F5F4` | Chữ trên thẻ                                 |                                                  |
| `muted`                  | `#F3EFE8` | `#292524` | Nền phụ, ô code, hàng chọn                   |                                                  |
| `muted-foreground`       | `#6B635E` | `#A8A29E` | Chữ phụ: ngày, tác giả, gợi ý                | 5.1 trên muted, 5.6 trên nền / 6.0 trên card tối |
| `primary`                | `#C2410C` | `#FB923C` | Nút chính, liên kết, điểm nhấn (gạch nung)   | 4.9 / 7.7 trên nền                               |
| `primary-foreground`     | `#FFFFFF` | `#1C1917` | Chữ trên nút chính                           | 5.2 / 7.7                                        |
| `secondary`              | `#15803D` | `#4ADE80` | Điểm nhấn phụ (lá), trạng thái tích cực      | 4.7 / 10.0                                       |
| `border`                 | `#E7E5E4` | `#44403C` | Viền trang trí, đường phân cách              | (trang trí, không mang thông tin)                |
| `input`                  | `#8F8883` | `#78716C` | Viền ô nhập, checkbox, thành phần điều khiển | 3.3 / 3.7 (≥ 3:1 cho UI)                         |
| `ring`                   | `#C2410C` | `#FB923C` | Viền focus khi dùng bàn phím                 | 4.9 / 7.7                                        |
| `destructive`            | `#B91C1C` | `#F87171` | Xóa, cấm, lỗi                                | trắng trên `#B91C1C`: 6.5                        |
| `destructive-foreground` | `#FFFFFF` | `#1C1917` |                                              |                                                  |

Không dùng `#78716C` cho chữ nhỏ trên nền `muted` (chỉ đạt 4.2).

### 2.2 Màu danh mục (topic accent)

Mỗi danh mục một màu để nhận ra nhanh trong feed. Màu chỉ là tín hiệu phụ: **luôn kèm tên danh mục bằng chữ**.

| Danh mục      | Chữ (sáng) | Nền badge (sáng) | Chữ (tối) | Tương phản |
| ------------- | ---------- | ---------------- | --------- | ---------- |
| Đời sống      | `#B45309`  | `#FEF3C7`        | `#FBBF24` | 4.5 / 10.5 |
| Công nghệ     | `#1D4ED8`  | `#DBEAFE`        | `#60A5FA` | 5.5 / 6.9  |
| Học tập       | `#047857`  | `#D1FAE5`        | `#34D399` | 4.8 / 9.1  |
| Góc kể chuyện | `#7E22CE`  | `#F3E8FF`        | `#C084FC` | 5.9 / 6.6  |
| Hỏi đáp       | `#BE123C`  | `#FFE4E6`        | `#FB7185` | 5.2 / 6.5  |

Badge chế độ tối: chữ màu "tối" ở trên, nền là chính màu đó với độ mờ 15% trên `card`. Danh mục mới thêm sau phải kiểm tra tương phản trước khi dùng.

### 2.3 Màu trạng thái bài

Trạng thái phải **luôn hiển thị** cho tác giả và admin (skill cảnh báo: "hidden post state" là anti-pattern của forum).

| Trạng thái | Chữ       | Nền       | Tương phản | Kèm biểu tượng |
| ---------- | --------- | --------- | ---------- | -------------- |
| Bản nháp   | `#57534E` | `#E7E5E4` | 6.1        | bút chì        |
| Chờ duyệt  | `#92400E` | `#FEF3C7` | 6.4        | đồng hồ        |
| Đã đăng    | `#166534` | `#DCFCE7` | 6.5        | dấu tích       |
| Bị từ chối | `#991B1B` | `#FEE2E2` | 6.8        | dấu x          |
| Đã ẩn      | `#57534E` | `#F5F5F4` | 7.0        | mắt gạch chéo  |

Không dựa vào màu đơn thuần: badge luôn có chữ, nên có thêm biểu tượng.

## 3. Chữ

Cả hai font đều có bộ ký tự **vietnamese** trên Google Fonts (đã kiểm tra trong dữ liệu của skill).

| Vai trò          | Font                                                 | Dùng cho                                   |
| ---------------- | ---------------------------------------------------- | ------------------------------------------ |
| Giao diện        | **Be Vietnam Pro** (400, 500, 600, 700)              | Nút, menu, tiêu đề, thẻ bài, admin, mobile |
| Nội dung đọc dài | **Lora** (400, 400 italic, 600)                      | Thân bài viết trong trang chi tiết         |
| Code             | `ui-monospace, "Cascadia Code", Consolas, monospace` | Khối code trong Markdown                   |

Web nạp bằng `next/font/google` với `subsets: ["vietnamese", "latin"]`; admin nạp qua `@fontsource` hoặc Google Fonts có `&subset=vietnamese`; mobile dùng `@expo-google-fonts/be-vietnam-pro` và `@expo-google-fonts/lora`.

### Thang cỡ chữ

| Token       | Cỡ / dòng                          | Dùng cho                               |
| ----------- | ---------------------------------- | -------------------------------------- |
| `text-xs`   | 12 / 16                            | Nhãn rất phụ (không dùng cho đoạn văn) |
| `text-sm`   | 14 / 20                            | Metadata, badge, chữ phụ               |
| `text-base` | 16 / 24                            | Chữ giao diện mặc định, bình luận      |
| `text-lg`   | 18 / 28                            | Tiêu đề thẻ bài                        |
| `text-xl`   | 20 / 28                            | Tiêu đề khối                           |
| `text-2xl`  | 24 / 32                            | Tiêu đề trang (mobile)                 |
| `text-3xl`  | 30 / 38                            | Tiêu đề trang (web)                    |
| `text-4xl`  | 36 / 44                            | Tiêu đề bài viết (web, màn hình rộng)  |
| `prose`     | 18 / 1.7 (web), 17 / 1.65 (mobile) | Thân bài viết, font Lora               |

Bề ngang cột chữ bài viết tối đa khoảng 70 ký tự (`max-w-[68ch]`). Không dùng chữ dưới 12px.

## 4. Khoảng cách, bo góc, đổ bóng

Nhịp 4/8. Density 5 (chuẩn): khoảng cách khối 16 đến 64.

| Token     | Giá trị |     | Token      | Giá trị |
| --------- | ------- | --- | ---------- | ------- |
| `space-1` | 4px     |     | `space-6`  | 24px    |
| `space-2` | 8px     |     | `space-8`  | 32px    |
| `space-3` | 12px    |     | `space-12` | 48px    |
| `space-4` | 16px    |     | `space-16` | 64px    |

- Lề ngang: 16px (điện thoại), 24px (tablet), 32px (desktop). Nội dung tối đa 1120px; cột đọc bài 720px.
- Bo góc: `radius-sm` 6px (badge, ô nhập), `radius-md` 10px (nút, thẻ), `radius-lg` 14px (hộp thoại, bottom sheet), `radius-full` (avatar).
- Đổ bóng: chỉ một mức nhẹ cho thẻ nổi và hộp thoại: `0 1px 2px rgb(41 37 36 / 0.06), 0 4px 12px rgb(41 37 36 / 0.06)`. Chế độ tối dùng viền `border` thay cho bóng.

## 5. Chuyển động

Motion 2/10: chỉ phản hồi tương tác, không có hiệu ứng trang trí, **không dùng GSAP**.

| Token           | Thời gian                                           | Dùng cho                      |
| --------------- | --------------------------------------------------- | ----------------------------- |
| `duration-fast` | 120ms                                               | Đổi màu hover, nhấn nút       |
| `duration-base` | 200ms                                               | Mở dropdown, tooltip, đổi tab |
| `duration-slow` | 280ms                                               | Hộp thoại, bottom sheet vào   |
| easing          | `cubic-bezier(0.2, 0, 0, 1)` vào, rời nhanh hơn vào |                               |

- Chỉ animate `opacity` và `transform`, không animate `width`/`height`.
- Tôn trọng `prefers-reduced-motion` (web) và "Reduce Motion" (mobile): tắt chuyển động không thiết yếu, hiện ngay trạng thái cuối.
- Không cuộn vô hạn có hiệu ứng nhảy; spinner chỉ dùng cho trạng thái đang tải.

## 6. Biểu tượng

- Một bộ duy nhất: **Lucide** (`lucide-react` cho web/admin, `lucide-react-native` cho mobile), kiểu outline, nét 2px (1.75 ở cỡ 16).
- Cỡ: `icon-sm` 16, `icon-md` 20, `icon-lg` 24.
- Không dùng emoji làm biểu tượng điều khiển hay điều hướng.
- Biểu tượng đi kèm chữ: `aria-hidden="true"`. Nút chỉ có biểu tượng: bắt buộc có nhãn (`aria-label` / `accessibilityLabel`) tiếng Việt.
- Biểu tượng mang ý nghĩa cần tương phản ≥ 3:1 với nền.

## 7. Thành phần chính

### Thẻ bài trong feed

- Thứ tự đọc: badge danh mục → tiêu đề (`text-lg`, 600) → tóm tắt 2 dòng (`muted-foreground`) → hàng metadata (avatar 24, tên, "2 giờ trước", số bình luận).
- Cả thẻ bấm được (một liên kết bao ngoài), vùng bấm đủ lớn; hover đổi nền sang `muted` trong `duration-fast`.
- Bài chưa đăng (chỉ tác giả thấy): badge trạng thái ở góc phải.

### Trang chi tiết bài (thread view)

- Tiêu đề, metadata, nội dung Markdown font Lora, danh sách tag, rồi khối bình luận.
- Bình luận: avatar 32, tên, thời gian, nội dung `text-base`. Trả lời thụt vào 1 cấp (40px trên web, 24px trên mobile) với đường dọc `border` bên trái; không lồng sâu hơn.
- Bình luận bị ẩn: admin thấy mờ (opacity 60%) kèm nhãn "Đã ẩn"; người thường không thấy.
- Có dấu hiệu kiểm duyệt rõ ràng (skill cảnh báo "no moderation cues" là anti-pattern): bài bị từ chối hiện lý do trong hộp màu `destructive` nhạt cho tác giả.

### Nút

| Loại                                | Dùng khi                                                      |
| ----------------------------------- | ------------------------------------------------------------- |
| Primary (`primary`)                 | Một hành động chính mỗi màn hình: "Đăng bài", "Gửi bình luận" |
| Secondary (viền `input`, nền trong) | Hành động phụ: "Lưu nháp", "Hủy"                              |
| Ghost                               | Hành động trong danh sách, thanh công cụ                      |
| Destructive                         | Xóa, cấm, từ chối                                             |

Cao tối thiểu 40px (web), 44pt (mobile). Trạng thái đang gửi: khóa nút, hiện spinner nhỏ và giữ nguyên bề rộng.

### Form

- Nhãn luôn hiển thị phía trên ô (không dùng placeholder thay nhãn).
- Lỗi hiện ngay dưới ô, màu `destructive`, kèm biểu tượng; kiểm tra khi rời ô và khi gửi.
- Ô nhập viền `input`, focus viền `ring` 2px.

### Trạng thái màn hình

Mọi danh sách và trang dữ liệu đều có đủ: đang tải (skeleton cùng hình dạng với nội dung thật, giữ chỗ để không xô lệch bố cục), lỗi (câu tiếng Việt + nút "Thử lại"), trống (câu thân thiện theo `docs/giong-van-va-giao-dien.md`), có dữ liệu.

## 8. Bố cục và responsive

- Mobile-first. Điểm ngắt kiểm tra: 375, 768, 1024, 1440.
- Web desktop: feed một cột giữa (720px) + cột phải 300px (danh mục, tag nổi bật) từ 1024px trở lên; dưới 1024px bỏ cột phải.
- Không cuộn ngang ở bất kỳ kích thước nào; không chặn phóng to (`user-scalable` giữ mặc định).
- Header web cố định mỏng (56px): logo, ô tìm kiếm, nút "Viết bài", avatar.

## 9. Tránh (anti-patterns)

- Ẩn trạng thái bài với tác giả (hidden post state)
- Không có dấu hiệu kiểm duyệt (no moderation cues)
- Luồng bình luận rối: lồng nhiều cấp, thiếu thời gian và tên người trả lời (cluttered threads)
- Chữ phụ xám nhạt trên nền xám (gray-on-gray), chữ nội dung dưới 16px
- Emoji làm biểu tượng, trộn nhiều bộ biểu tượng
- Màu là tín hiệu duy nhất (trạng thái, danh mục)
- Mã màu viết thẳng trong component thay vì token

## 10. Checklist trước khi giao

- [ ] Dùng token, không mã màu cứng
- [ ] Chữ thường ≥ 4.5:1, thành phần UI và biểu tượng có nghĩa ≥ 3:1, kiểm tra **riêng** chế độ tối
- [ ] Focus nhìn thấy được khi dùng bàn phím; thứ tự tab hợp lý
- [ ] Nút biểu tượng có nhãn tiếng Việt; ảnh có `alt`
- [ ] Vùng bấm ≥ 44×44 (mobile), khoảng cách giữa vùng bấm ≥ 8px
- [ ] `cursor-pointer` cho phần tử bấm được (web); hover chuyển trong 120 đến 200ms
- [ ] Đủ 4 trạng thái: tải, lỗi, trống, dữ liệu; skeleton không làm xô bố cục
- [ ] `prefers-reduced-motion` được tôn trọng
- [ ] Kiểm tra ở 375, 768, 1024, 1440; không cuộn ngang
- [ ] Tiếng Việt hiển thị đủ dấu với cả hai font

## Nguồn và điều chỉnh

Lấy từ skill ui-ux-pro-max:

- `--domain product`: loại "Forum / Discussion Board" → phong cách Minimalism & Swiss, pattern Feed + Thread View, màu danh mục + chỉ báo.
- `--design-system "forum discussion board thread"` (variance 3, motion 2, density 5): chiến lược màu "warm, welcoming", anti-patterns "no moderation cues, cluttered threads, hidden post state", hiệu ứng nhẹ, checklist.
- `--domain google-fonts`: kiểm tra subset `vietnamese` của các font ứng viên.
- `--domain icons`, `--stack shadcn`, `--stack react-native`: quy tắc ngữ nghĩa biểu tượng, bảng và menu hành động, phản hồi khi nhấn.

Điều chỉnh có chủ ý so với gợi ý tự động:

- **Font**: skill gợi ý Atkinson Hyperlegible, nhưng font này **không có subset vietnamese** → giữ Be Vietnam Pro + Lora (đều có).
- **Màu**: skill gợi ý xám xanh + xanh dương; đổi sang bảng màu ấm (gạch nung, lá, giấy kem) để khớp chiến lược "warm, welcoming" và tên Xóm Nhỏ. Mọi cặp màu đã tính tương phản lại; chữ phụ đổi từ `#78716C` sang `#6B635E`, thêm token `input` cho viền ô nhập đạt 3:1.
- **Biểu tượng**: skill ưu tiên Phosphor; chọn Lucide vì shadcn/ui dùng Lucide bên trong và có bản React Native, giữ được một bộ biểu tượng trên mọi bề mặt.
- **Chuyển động**: bỏ gợi ý GSAP scroll reveal; motion 2/10 chỉ cần CSS transition.
- Tra quy tắc riêng cho luồng bình luận lồng nhau không có kết quả khớp (đã thử lại một lần), nên quy tắc ở mục 7 dựa trên `docs/tinh-nang.md` chứ không lấy từ dữ liệu của skill.
