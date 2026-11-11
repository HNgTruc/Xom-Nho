# Design System: Xóm Nhỏ (MASTER)

Nguồn sự thật cho mọi quyết định giao diện của web, admin và mobile-app. File override trong `pages/` (nếu có) được ưu tiên hơn file này cho trang/ứng dụng tương ứng.

- Token trong code: `frontend/ui/src/tokens/*` (TS) và `frontend/ui/src/styles/theme.css` (CSS). Hai nơi đó phải khớp file này.
- Lập bằng skill **ui-ux-pro-max** (xem mục "Nguồn và điều chỉnh" cuối file), ngày 2026-11-01. Đổi sang kính mờ trên ảnh nền, màu nhấn đen + xanh nhạt, ngày 2026-11-11 (mục 2.4).

## 1. Định hướng

| Mục            | Quyết định                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Loại sản phẩm  | Forum / Discussion Board                                                                                                                   |
| Phong cách     | **Glassmorphism trên ảnh nền**: một khung kính lớn làm mờ ảnh biển, bên trong là các tấm kính; điều hướng và nút dạng viên thuốc (mục 2.4) |
| Pattern        | Feed (danh sách bài) + Thread View (bài + bình luận)                                                                                       |
| Chiến lược màu | Trung tính lạnh hợp ảnh biển; nhấn **đen** (hành động chính, mục đang chọn) và **xanh nhạt** (điểm nhấn nhỏ); màu riêng cho từng danh mục  |
| Chế độ         | Sáng và tối, cả hai đều phải đạt tương phản ở mọi chỗ của ảnh nền                                                                          |
| Dial           | Variance 4/10 · Motion 5/10 (khối hiện ra lần lượt, hover nổi lên) · Density 5/10 (chuẩn) cho web/mobile                                   |
| Cảm giác       | Ngồi trong xóm nhìn ra biển qua ô kính: nội dung là chính, đọc lâu không mỏi                                                               |

## 2. Màu

Mọi cặp chữ/nền dưới đây đã tính tương phản theo WCAG 2.x. Chữ nằm trên kính nên tương phản thật còn tùy chỗ ảnh nền; mục 2.4 có số tính trên kính.

### 2.1 Màu nền tảng

| Token                    | Sáng      | Tối       | Dùng cho                                                | Tương phản (sáng / tối, trên `card`) |
| ------------------------ | --------- | --------- | ------------------------------------------------------- | ------------------------------------ |
| `background`             | `#E6EEF0` | `#0B1214` | Màu nền khi ảnh chưa tải, khung kính khi tắt trong suốt |                                      |
| `foreground`             | `#18181B` | `#FAFAFA` | Chữ chính                                               | 17.7 / 17.0                          |
| `card`                   | `#FFFFFF` | `#18181B` | `Card` đặc (admin), hộp thoại                           |                                      |
| `card-foreground`        | `#18181B` | `#FAFAFA` | Chữ trên thẻ                                            |                                      |
| `muted`                  | `#F1F4F5` | `#27272A` | Nền phụ, ô code, hover trong thanh điều hướng           |                                      |
| `muted-foreground`       | `#52525B` | `#A1A1AA` | Chữ phụ: ngày, tác giả, gợi ý                           | 7.7 / 6.9 (trên `muted`: 7.0 / 5.8)  |
| `primary`                | `#18181B` | `#FAFAFA` | Nút chính, mục đang chọn (viên đen / viên trắng)        |                                      |
| `primary-foreground`     | `#FFFFFF` | `#18181B` | Chữ trên `primary`                                      | 17.7 / 17.0                          |
| `accent`                 | `#BAE6FD` | `#7DD3FC` | Điểm nhấn xanh nhạt: viên số bình luận, hover thẻ tag   |                                      |
| `accent-foreground`      | `#18181B` | `#09090B` | Chữ trên `accent`                                       | 13.4 / 11.9                          |
| `link`                   | `#075985` | `#7DD3FC` | Liên kết trong bài, trong form (luôn có gạch chân)      | 7.6 / 10.6                           |
| `secondary`              | `#15803D` | `#4ADE80` | Điểm nhấn phụ (lá), trạng thái tích cực                 |                                      |
| `secondary-foreground`   | `#FFFFFF` | `#18181B` | Chữ trên `secondary`                                    | 5.0 / 10.2                           |
| `border`                 | `#E4E4E7` | `#3F3F46` | Viền trang trí, đường phân cách                         | (trang trí)                          |
| `input`                  | `#71717A` | `#8B8B94` | Viền ô nhập, checkbox, thành phần điều khiển            | 4.8 / 5.2 (≥ 3:1 cho UI)             |
| `ring`                   | `#0369A1` | `#38BDF8` | Viền focus khi dùng bàn phím                            | 5.9 / 8.3                            |
| `destructive`            | `#B91C1C` | `#F87171` | Xóa, cấm, lỗi                                           | chữ trên nền: 6.5 / 6.4              |
| `destructive-foreground` | `#FFFFFF` | `#18181B` |                                                         |                                      |

`primary` trùng màu `foreground`, nên liên kết **không** dùng `primary` (trông như chữ thường): dùng `link` kèm gạch chân.

### 2.2 Màu danh mục (topic accent)

Mỗi danh mục một màu để nhận ra nhanh trong feed. Màu chỉ là tín hiệu phụ: **luôn kèm tên danh mục bằng chữ**.

| Danh mục      | Token    | Chữ (sáng) | Nền badge (sáng) | Chữ (tối) | Nền badge (tối) | Tương phản |
| ------------- | -------- | ---------- | ---------------- | --------- | --------------- | ---------- |
| Đời sống      | `amber`  | `#B45309`  | `#FEF3C7`        | `#FBBF24` | `#382F1C`       | 4.5 / 7.9  |
| Công nghệ     | `blue`   | `#1D4ED8`  | `#DBEAFE`        | `#60A5FA` | `#222C3A`       | 5.5 / 5.6  |
| Học tập       | `green`  | `#047857`  | `#D1FAE5`        | `#34D399` | `#1C322D`       | 4.8 / 7.1  |
| Góc kể chuyện | `purple` | `#7E22CE`  | `#F3E8FF`        | `#C084FC` | `#30273B`       | 5.9 / 5.4  |
| Hỏi đáp       | `rose`   | `#BE123C`  | `#FFE4E6`        | `#FB7185` | `#38242A`       | 5.2 / 5.4  |

Nền badge tối là **màu đặc**: màu chữ trộn 14% trên `#18181B` (đổi 2026-11-11). Trước đó là màu chữ mờ 12%, nhưng nằm trên kính thì nền mờ đổi theo chỗ ảnh nền, và ở chỗ ảnh sáng (mây) `purple`, `rose` tụt dưới 4.5.

Token đặt theo sắc độ, không theo tên danh mục: danh mục lưu khóa màu (`amber`, `blue`...), nên đổi tên hay thêm danh mục không phải sửa token. Danh mục mới chọn trong 5 màu này; muốn thêm màu thứ sáu thì phải tính tương phản cả hai chế độ trước.

### 2.3 Màu trạng thái bài

Trạng thái phải **luôn hiển thị** cho tác giả và admin (skill cảnh báo: "hidden post state" là anti-pattern của forum).

| Trạng thái | Token       | Chữ (sáng) | Nền (sáng) | Chữ (tối) | Nền (tối) | Tương phản | Kèm biểu tượng |
| ---------- | ----------- | ---------- | ---------- | --------- | --------- | ---------- | -------------- |
| Bản nháp   | `draft`     | `#52525B`  | `#E4E4E7`  | `#D4D4D8` | `#323235` | 6.1 / 8.7  | bút chì        |
| Chờ duyệt  | `pending`   | `#92400E`  | `#FEF3C7`  | `#FCD34D` | `#383222` | 6.4 / 8.8  | đồng hồ        |
| Đã đăng    | `published` | `#166534`  | `#DCFCE7`  | `#86EFAC` | `#27362F` | 6.5 / 9.0  | dấu tích       |
| Bị từ chối | `rejected`  | `#991B1B`  | `#FEE2E2`  | `#FCA5A5` | `#382C2E` | 6.8 / 7.1  | dấu x          |
| Đã ẩn      | `hidden`    | `#52525B`  | `#F4F4F5`  | `#A1A1AA` | `#2B2B2F` | 7.0 / 5.5  | mắt gạch chéo  |

Nền tối đặc như badge danh mục (trộn 14% trên `#18181B`). Không dựa vào màu đơn thuần: badge luôn có chữ, nên có thêm biểu tượng.

### 2.4 Kính mờ trên ảnh nền

Bố cục theo mẫu tham khảo của chủ dự án (dashboard kính mờ trên ảnh nội thất): ảnh nền phủ cả màn hình, **một khung kính lớn** làm mờ ảnh, bên trong là các tấm kính. Token: `frontend/ui/src/tokens/glass.ts`; CSS: `theme.css`.

**Ảnh nền**: biển và mây (`frontend/web/src/assets/backdrop/bien-may.jpg`, ảnh của Tuấn Vũ trên Pexels, giấy phép Pexels cho dùng miễn phí, không bắt buộc ghi nguồn). Hiển thị bằng `next/image` (tự sinh WebP/AVIF theo cỡ màn hình, có bản mờ khi đang tải); chế độ tối giảm sáng ảnh 25%. Sau khi làm mờ 6px, ảnh trải từ `#061011` (mặt biển, bụi cây) đến `#F1F2ED` (mây): mọi tương phản dưới đây tính ở cả năm mức (tối nhất, 5%, 50%, 95%, sáng nhất), số ghi là mức thấp nhất. **Đổi ảnh thì đo lại** (script đo bằng canvas: ghi trong mục "Nguồn và điều chỉnh").

| Lớp (utility)   | Sáng                               | Tối                                  | Làm mờ         | Dùng cho                                                                                      |
| --------------- | ---------------------------------- | ------------------------------------ | -------------- | --------------------------------------------------------------------------------------------- |
| `glass-shell`   | trắng 30%                          | `#09090B` 45%                        | ảnh mờ sẵn 6px | Khung lớn bao cả trang (`SiteShell`), rất trong. Không đặt chữ thẳng lên                      |
| `glass`         | trắng 75%                          | `#09090B` 68%                        | không          | Tấm trong khung: thẻ bài, đầu trang, hồ sơ, khung trống                                       |
| `glass-strong`  | trắng 85%                          | `#09090B` 85%                        | không          | Chỗ đọc lâu: khung bài viết, cài đặt, 404/lỗi; hover của thẻ                                  |
| `glass-bar`     | trắng 85%                          | `#09090B` 85%                        | 10px           | Thứ trôi trên nội dung (header dính, menu thả xuống) hoặc nằm thẳng trên ảnh (form đăng nhập) |
| `glass-button`  | trắng 45%, hover 70%               | `#18181B` 45%, hover 70% (`#27272A`) | không          | Nút phụ, thanh tab, thanh phân trang, chip thẻ, nút mở menu tài khoản. Chữ dùng `foreground`  |
| `glass-primary` | `#18181B` 82%, hover `#3F3F46` 90% | `#FAFAFA` 88%, hover `#D4D4D8` 92%   | không          | Nút chính, mục đang chọn (tab, điều hướng, trang hiện tại)                                    |

Không giảm làm mờ dưới 6px: chữ phụ trên `glass` tối đã sát 5.0, ảnh càng rõ thì chỗ mây càng sáng.

Viền kính `glass-border` (trắng 55% / trắng 10%), viền hover `glass-border-hover` (`#71717A` 45% / trắng 24%), bóng `glass-shadow`, `glass-shadow-hover`, `glass-shell-shadow` (bóng lớn + vệt sáng mép trên). `glass-button` dùng viền `glass-border-hover`: viền trắng không thấy được khi nút nằm trên tấm trắng.

Tương phản thấp nhất trên ảnh nền (đổi 2026-11-11: khung trong hơn, làm mờ giảm từ 28px xuống 6px để ảnh rõ theo yêu cầu; tính với ảnh làm mờ 6px):

| Chỗ                              | Chữ chính   | Chữ phụ     | `link` | `input` | `ring` |
| -------------------------------- | ----------- | ----------- | ------ | ------- | ------ |
| `glass`, sáng                    | 12.1        | 5.3         | 5.1    | 3.3     | 4.0    |
| `glass-strong`, sáng             | 14.2        | 6.2         | 6.0    | 3.9     | 4.7    |
| `glass`, tối                     | 12.3        | 5.0         | 7.7    | 3.8     | 6.0    |
| `glass-strong`, tối              | 16.3        | 6.6         | 10.2   | 5.0     | 7.9    |
| Tấm tối (`dark`) trên khung sáng | 13.3        | 5.4         | 8.3    | 4.1     | 6.5    |
| `glass-button`, sáng / tối       | 7.0 / 7.0   | (không đặt) |        |         |        |
| `glass-primary`, sáng / tối      | 10.4 / 13.1 |             |        |         |        |

Quy tắc:

- Không đặt chữ thẳng lên ảnh nền hay lên khung (khung chỉ còn 30%). Chữ nằm trên tấm `glass` trở lên, hoặc trên `glass-button` nếu là chữ chính (`foreground`); **chữ phụ không đặt trên `glass-button`**.
- Nút kính tối dùng màu sẫm (`#18181B` 45%), không dùng trắng mờ: trắng 10% trên khung tối ở chỗ mây chỉ đạt 3.1.
- **Tấm tối giữa trang sáng**: thêm class `dark` cho tấm (ví dụ `dark glass-strong text-foreground`), mọi token bên trong đổi sang bộ tối. Đã tính: chữ ≥ 13.3, chữ phụ ≥ 5.4 ở mọi chỗ ảnh.
- **Chỉ `glass-bar` dùng `backdrop-filter`** (header dính, menu thả xuống, form đăng nhập: nhỏ, trôi trên nội dung). Ảnh nền được làm mờ sẵn một lần (`blur-glass-shell` trên ảnh, phóng to 4% để mép mờ nằm ngoài màn hình); khung lớn, tấm, nút chỉ là màu trong suốt trên ảnh đó. Lý do (đo 2026-11-11): khung cao 2.9 màn hình mà làm mờ phía sau thì mỗi khung hình cuộn trình duyệt phải làm mờ lại cả màn hình, cuộn bị giật. Tương phản không đổi vì vẫn là ảnh mờ 6px nằm sau.
- Dự phòng: trình duyệt không có `backdrop-filter`, hoặc thiết bị báo `prefers-reduced-transparency: reduce` (Windows tắt "Transparency effects"), thì khung thành `background`, các tấm thành `card` đặc.
- Người dùng ghi đè trong **Hiển thị và trợ năng** (menu ảnh đại diện, `frontend/ui/src/lib/display-preferences.ts`): `<html data-transparency="on">` luôn hiện kính, `"off"` luôn đặc; `data-motion="reduce"` tắt chuyển động như cài đặt hệ thống; chế độ tối Tắt / Bật / Tự động đổi class `dark` trên `<html>`. Script trong `<head>` áp dụng trước khi trang vẽ.
- Không thêm `backdrop-filter` cho phần tử lớn hay phần tử cuộn theo trang; cần nhìn xuyên ra ảnh thì dùng màu trong suốt, ảnh đã mờ sẵn.

Đổi giá trị nào ở đây thì tính lại tương phản ở cả năm mức sáng của ảnh, cho cả hai chế độ, trước khi sửa token.

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

- Khung lớn rộng gần hết màn hình: cách mép 8px (điện thoại), 12px (tablet), 16px (desktop), không giới hạn bề rộng. Nội dung bên trong căn giữa, tối đa 1320px; lề 12 đến 32px; cột đọc bài và cài đặt 760px.
- Bo góc: `radius-sm` 6px (badge, ô nhập), `radius-md` 10px (khối con trong tấm), `radius-lg` 14px, `radius-xl` 20px (mọi tấm kính: thẻ bài, đầu trang, hồ sơ, khung bài viết), `radius-2xl` 28px (khung lớn, form đăng nhập), `radius-full` (nút, điều hướng, tab, phân trang, badge thẻ, avatar: dạng viên thuốc như mẫu).
- Đổ bóng: tấm kính dùng `glass-shadow`, hover `glass-shadow-hover`; khung lớn `glass-shell-shadow`. `shadow-card` (`0 1px 2px rgb(24 24 27 / 0.06), 0 4px 12px rgb(24 24 27 / 0.06)`, chế độ tối dùng viền) giữ cho `Card` đặc của admin.

## 5. Chuyển động

Motion 5/10 (đổi từ 2/10 ngày 2026-11-11, theo mẫu tham khảo): mỗi khối hiện ra lần lượt khi trang tải, phản hồi rõ khi hover. Vẫn **không dùng GSAP**, chỉ CSS.

| Token           | Thời gian                                  | Dùng cho                                                                                           |
| --------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `duration-fast` | 120ms                                      | Đổi màu chữ, nhấn nút                                                                              |
| `duration-base` | 200ms                                      | Hover thẻ (nổi lên), đổi tab, mở dropdown                                                          |
| `duration-slow` | 280ms                                      | Hộp thoại, bottom sheet vào                                                                        |
| `rise-in`       | 360ms, `cubic-bezier(0.16, 1, 0.3, 1)`     | Khối hiện ra: mờ → rõ, trượt lên 8px (không thu nhỏ: chữ nhòe khi chạy)                            |
| stagger         | 35ms mỗi bậc, tối đa 6 bậc                 | Khối sau hiện trễ hơn khối trước; khối cuối xong sau 570ms (trước đây 1000ms, chuyển trang thấy ì) |
| easing          | `cubic-bezier(0.2, 0, 0, 1)` cho tương tác |                                                                                                    |

Thứ tự hiện ra trên trang danh sách: header (bậc 0) → đầu trang (0) → tab sắp xếp (1) → thẻ bài thứ i (bậc i + 2). Trang bài viết, form, 404: một khối, bậc 0. Dùng `animate-rise-in` và đặt `--stagger` trên chính phần tử.

- Hover thẻ bài: nổi lên 2px, kính đặc hơn, viền rõ lên (chuyển mượt 200ms); bóng đậm hơn đổi ngay, **không chuyển mượt `box-shadow`** (bóng lớn phải vẽ lại mỗi khung hình). Hover thẻ tag: chữ đậm lên và gạch chân.
- Chỉ animate `opacity` và `transform` (`translate`, `scale`), không animate `width`/`height`.
- Tôn trọng `prefers-reduced-motion` (web) và "Reduce Motion" (mobile): bỏ trễ, bỏ chuyển động, hiện ngay trạng thái cuối.
- Không cuộn vô hạn có hiệu ứng nhảy; spinner chỉ dùng cho trạng thái đang tải.

## 6. Biểu tượng

- Một bộ duy nhất: **Lucide** (`lucide-react` cho web/admin, `lucide-react-native` cho mobile), kiểu outline, nét 2px (1.75 ở cỡ 16).
- Cỡ: `icon-sm` 16, `icon-md` 20, `icon-lg` 24.
- Không dùng emoji làm biểu tượng điều khiển hay điều hướng.
- Biểu tượng đi kèm chữ: `aria-hidden="true"`. Nút chỉ có biểu tượng: bắt buộc có nhãn (`aria-label` / `accessibilityLabel`) tiếng Việt.
- Biểu tượng mang ý nghĩa cần tương phản ≥ 3:1 với nền.

## 7. Thành phần chính

### Tấm tạo bài và hộp soạn (trang chủ)

- Tấm `glass` đầu feed (thay đầu trang "Bài viết trong xóm", `h1` chỉ còn cho trình đọc màn hình): ảnh đại diện 40px, viên viền `input` 60% cao 44px ghi "Chào {tên}, hôm nay có chuyện gì?" (`muted-foreground` trên `glass`), dưới đường kẻ là nút ghost **Ảnh/Video** và chỗ báo "Bài của bạn đã lên xóm." (`role=status`).
- Hộp soạn là `Dialog` của `ui`: tấm `glass-bar` bo `radius-2xl`, rộng tối đa 576px, dưới 640px rộng gần hết màn hình; lớp phủ đen 40% không làm mờ. Thứ tự: tiêu đề hộp + tên người đăng, ô tiêu đề (không bắt buộc), ô nội dung chữ 18px, lưới xem trước 3 cột (4 cột từ 640px) ô vuông bo `radius-md`, nút gỡ tròn 32px nền đen 60%; ô đang tải phủ đen 45% có vòng quay; ô lỗi viền `destructive` và dải lỗi chữ trắng trên `destructive`. Rồi nút viền Ảnh/Video + dòng giới hạn file, chọn danh mục (select gốc, cao 44px trên điện thoại), nút chính **Đăng bài** (rộng hết trên điện thoại).

### Thẻ bài trong feed

- Thứ tự đọc: badge danh mục → tiêu đề (`text-lg`, 600) → tóm tắt 2 dòng (`muted-foreground`) → lưới ảnh/video → hàng metadata (avatar 24, tên, "2 giờ trước", số bình luận).
- Bài không có tiêu đề (soạn kiểu mạng xã hội): phần đầu nội dung làm chữ chính (`text-base`, `card-foreground`, tối đa 4 dòng).
- Lưới ảnh/video bo `radius-lg`, khe 4px: 1 ô tỉ lệ 16:9; 2 ô đôi; 3 ô thì ô đầu cao gấp đôi bên trái; 4 ô trở lên 2x2, ô cuối phủ đen 55% ghi "+N". Video chỉ hiện khung đầu và nút phát tròn đen 60%. Ảnh lấy thẳng từ backend (`next/image` `unoptimized`, vì cần cookie). Lưới nằm dưới lớp liên kết của thẻ: bấm ô nào cũng mở bài.
- Trang bài: ảnh xếp dọc, giữ tỉ lệ (`object-contain`, cao tối đa 80vh), video có điều khiển, nền đen.
- Tấm `glass`, bo `radius-xl`. Cả thẻ bấm được (một liên kết bao ngoài), vùng bấm đủ lớn; hover theo mục 5.
- Số bình luận trong viên `accent` (xanh nhạt, chữ đen), như viên màu nhấn của mẫu.
- Bài chưa đăng (chỉ tác giả thấy): badge trạng thái ở góc phải.

### Trang chi tiết bài (thread view)

- Cả bài trên một tấm `glass-strong`: tiêu đề, metadata, nội dung Markdown font Lora, danh sách tag, rồi khối bình luận.
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

Dạng viên thuốc (`rounded-full`). Cao tối thiểu 40px (web), 44pt (mobile). Trạng thái đang gửi: khóa nút, hiện spinner nhỏ và giữ nguyên bề rộng.

Nút chính là `glass-primary`, nút viền (Secondary) là `glass-button`, nút ghost khi hover hiện `glass-button`; hover sang mức kính đã tính sẵn ở mục 2.4. Nút `secondary`, `destructive` vẫn là màu đặc: hover trộn 12% `foreground` (`color-mix(in srgb, var(--secondary), var(--foreground) 12%)`). **Không** tự làm mờ bằng `bg-primary/90`: độ mờ chưa tính tương phản.

### Nút tròn ở header (Tin nhắn, Thông báo)

- `glass-button` tròn 40px, biểu tượng Lucide 20px, bắt buộc `aria-label` tiếng Việt (có số chưa đọc thì nhãn đọc kèm số).
- Số chưa đọc: chấm `destructive` góc trên phải, chữ `text-xs` đậm, quá 99 ghi "99+"; chỉ để nhìn (`aria-hidden`).
- Bấm mở bảng `glass-bar` rộng 320px: tiêu đề, danh sách; trống thì một câu theo `docs/giong-van-va-giao-dien.md`.

### Ô tìm kiếm ở header

- Chỉ thành viên thấy. Từ 1024px: viên viền `input` 60% (giống viên logo) nền trong suốt, rộng 224px (1280px trở lên 288px), biểu tượng kính lúp 16px bên trái, chữ gợi ý "Tìm trong xóm" màu `muted-foreground` (nằm trên `glass-bar` nên đủ tương phản, không phải trên `glass-button`). Hover viền đậm lên, focus viền và vòng `ring`.
- Dưới 1024px: nút tròn kính lúp như Tin nhắn; bấm vào thì ô tìm nền `card` (đặc, để không lẫn với logo phía dưới) phủ ngang hàng trên của thanh, có nút ✕ đóng; Esc hoặc bấm ra ngoài cũng đóng, focus về nút kính lúp.
- Phím `/` đưa con trỏ vào ô (trừ khi đang gõ trong ô khác). Từ khóa rỗng thì Enter không đi đâu.
- Trang `/tim-kiem`: đầu trang `glass` (nhãn "Tìm kiếm", từ khóa trong ngoặc kép làm `h1`, số bài), thanh lọc danh mục `glass-button` như tab sắp xếp (cuộn ngang bên trong thanh), thẻ bài như feed, phân trang.

### Menu thả xuống

- Tấm `glass-bar` bo `radius-xl`, rộng tối thiểu 208px (không ăn theo bề ngang nút mở). Trang con (như "Hiển thị và trợ năng") thay nội dung menu, mục đầu là nút quay lại có mũi tên; đổi trang thì đưa focus vào mục đầu. Nhóm lựa chọn dùng `DropdownMenuRadioGroup`, chọn không đóng menu. Mục cao ≥ 40px, chữ 16px, có biểu tượng Lucide 16px; mục đang chọn bằng bàn phím nền `accent`.

### Form

- Nhãn luôn hiển thị phía trên ô (không dùng placeholder thay nhãn).
- Lỗi hiện ngay dưới ô, màu `destructive`, kèm biểu tượng; kiểm tra khi rời ô và khi gửi.
- Ô nhập viền `input`, focus viền `ring` 2px.

### Trạng thái màn hình

Mọi danh sách và trang dữ liệu đều có đủ: đang tải (skeleton cùng hình dạng với nội dung thật, giữ chỗ để không xô lệch bố cục), lỗi (câu tiếng Việt + nút "Thử lại"), trống (câu thân thiện theo `docs/giong-van-va-giao-dien.md`), có dữ liệu.

## 8. Bố cục và responsive

- Mobile-first. Điểm ngắt kiểm tra: 375, 768, 1024, 1440.
- Ảnh nền cố định phủ màn hình; `SiteShell` là khung kính lớn bao header và nội dung, chừa viền ảnh quanh khung.
- Header dính trong khung: thanh `glass-bar` gồm logo (viên có viền), điều hướng danh mục (viên; mục đang xem là viên `glass-primary`; **chỉ khi đã đăng nhập**), bên phải là nút Đăng nhập / Đăng ký (khách: header chỉ có logo và hai nút này), hoặc (đã đăng nhập) **ô tìm kiếm**, nút tròn **Tin nhắn**, **Thông báo** rồi **menu tài khoản** (viên `glass-button` có tên và ảnh đại diện; mở menu `glass-bar` gồm Hồ sơ, Cài đặt, Đăng xuất). Từ 1024px một hàng, bo `radius-full`; dưới 1024px điều hướng xuống hàng thứ hai, cuộn ngang bên trong thanh.
- Trang chào mừng của khách (`/`): cột 860px căn giữa theo chiều dọc; tấm `glass-strong` lớn (viên nhãn `accent`, tiêu đề `text-3xl` đến `text-5xl`, đoạn giới thiệu, nút chính **Tham gia xóm** và nút viền **Đăng nhập**, xếp dọc rộng hết trên điện thoại), dưới là ba tấm `glass` (biểu tượng Lucide trong vòng tròn `accent`, tiêu đề `text-lg`, một câu), ba cột từ 768px. Hiện ra lần lượt: tấm lớn bậc 0, ba tấm nhỏ bậc 1 đến 3.
- Feed một cột ở giữa, rộng tối đa 860px, ở mọi bề rộng. Không có cột phải (bỏ ngày 2026-11-11 theo yêu cầu): danh mục đã có trên thanh điều hướng của header.
- Tab sắp xếp và phân trang: thanh `glass-button` dạng viên thuốc, mục đang chọn là viên `glass-primary`.
- Hồ sơ `/u/<username>`: tấm `glass` có ảnh bìa (chưa có thì dải màu `accent`), ảnh đại diện 96 đến 112px viền `card` đè lên mép ảnh bìa, tên, viên vai trò `accent`, giới thiệu, ngày tham gia, số bài; bên dưới là feed bài của người đó.
- Không cuộn ngang trang ở bất kỳ kích thước nào (chỉ hàng điều hướng tự cuộn bên trong); không chặn phóng to.

## 9. Tránh (anti-patterns)

- Ẩn trạng thái bài với tác giả (hidden post state)
- Không có dấu hiệu kiểm duyệt (no moderation cues)
- Luồng bình luận rối: lồng nhiều cấp, thiếu thời gian và tên người trả lời (cluttered threads)
- Chữ phụ xám nhạt trên nền xám (gray-on-gray), chữ nội dung dưới 16px
- Emoji làm biểu tượng, trộn nhiều bộ biểu tượng
- Màu là tín hiệu duy nhất (trạng thái, danh mục)
- Mã màu viết thẳng trong component thay vì token
- Chữ đặt thẳng trên ảnh nền; chữ phụ, liên kết đặt thẳng trên khung kính (mục 2.4)
- Tấm trong khung tự làm mờ lần nữa; đổi ảnh nền mà không đo lại tương phản
- Liên kết dùng màu `primary` (trùng màu chữ, không nhận ra là liên kết)

## 10. Checklist trước khi giao

- [ ] Dùng token, không mã màu cứng
- [ ] Chữ thường ≥ 4.5:1, thành phần UI và biểu tượng có nghĩa ≥ 3:1, kiểm tra **riêng** chế độ tối
- [ ] Chữ phụ, liên kết, điều khiển nằm trên tấm `glass` trở lên; tương phản tính ở cả năm mức sáng của ảnh nền (mục 2.4)
- [ ] Tắt `backdrop-filter` (hoặc bật `prefers-reduced-transparency`) trang vẫn đọc được
- [ ] Chụp màn hình kiểm tra kính bằng trình duyệt headless: giả lập `prefers-reduced-transparency: no-preference` (headless mặc định báo `reduce`, ảnh chụp sẽ là bản dự phòng đặc chứ không phải kính)
- [ ] Focus nhìn thấy được khi dùng bàn phím; thứ tự tab hợp lý
- [ ] Nút biểu tượng có nhãn tiếng Việt; ảnh có `alt`
- [ ] Vùng bấm ≥ 44×44 (mobile), khoảng cách giữa vùng bấm ≥ 8px
- [ ] `cursor-pointer` cho phần tử bấm được (web); hover chuyển trong 120 đến 200ms
- [ ] Đủ 4 trạng thái: tải, lỗi, trống, dữ liệu; skeleton không làm xô bố cục
- [ ] Khối mới có `animate-rise-in` và `--stagger` đúng thứ tự (mục 5); `prefers-reduced-motion` tắt hết trễ và chuyển động
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
- **Phong cách (2026-11-11)**: chủ dự án chọn Glassmorphism, rồi đưa mẫu tham khảo (video TikTok, ảnh chụp: dashboard kính mờ trên ảnh nội thất, điều hướng viên thuốc, chip đen, màu nhấn vàng, khối hiện ra lần lượt). Chủ dự án chọn màu nhấn **đen + xanh nhạt** thay cho vàng, và ảnh nền biển của Tuấn Vũ (Pexels). Tra `--domain style "glassmorphism"`: blur 10 đến 20px, kính trắng 15 đến 30%, viền sáng 1px. Điều chỉnh: kính đặc hơn nhiều (60%, 85%) vì ảnh có chỗ gần đen lẫn gần trắng; bỏ bảng màu ấm (gạch nung, giấy kem) sang trung tính lạnh hợp ảnh biển. Không chạy lại `--design-system --persist --force`.
- **Đo ảnh nền**: vẽ ảnh lên canvas 1440×960 trong trình duyệt headless, `filter: blur(24px)`, bỏ mép 48px, lấy màu tối nhất, phân vị 5%, 50%, 95%, sáng nhất theo độ sáng tương đối; rồi tính tương phản chữ trên từng lớp kính trộn trên năm màu đó.
- Tra quy tắc riêng cho luồng bình luận lồng nhau không có kết quả khớp (đã thử lại một lần), nên quy tắc ở mục 7 dựa trên `docs/tinh-nang.md` chứ không lấy từ dữ liệu của skill.
