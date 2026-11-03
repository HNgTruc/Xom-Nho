# @xom-nho/ui

Design system Xóm Nhỏ: token thiết kế cho cả ba frontend, component React (shadcn/ui, Radix) cho web và admin. Nguồn sự thật: [design-system/xom-nho/MASTER.md](../design-system/xom-nho/MASTER.md). Quy tắc: [CLAUDE.md](CLAUDE.md).

## Dùng trong app

```ts
// Mobile (và bất cứ đâu): token TS thuần
import { colors, radius, fontSize } from "@xom-nho/ui/tokens";

// Web, admin: component
import { Button } from "@xom-nho/ui/components/button";
```

```css
/* Web, admin: file CSS chính của app */
@import "@xom-nho/ui/styles/theme.css";
```

`theme.css` đã gồm `@import "tailwindcss"`, nên app không import Tailwind lần nữa. Nó cũng import `shadcn/tailwind.css`, vì vậy `shadcn` nằm trong `dependencies` (không phải `devDependencies`) dù cũng là CLI. Font do app tự nạp (web: `next/font` với `variable: "--font-be-vietnam-pro"` và `"--font-lora"`; admin: `@fontsource`); không có biến thì theme rơi về tên font. Chế độ tối bật bằng class `dark` trên phần tử gốc.

Không có bước build: Next.js (`transpilePackages: ["@xom-nho/ui"]`), Vite và Metro đọc thẳng TypeScript.

## Có gì

| Phần                   | Nội dung                                                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/tokens/`          | `colors` (sáng/tối), `categoryColors`, `statusColors`, `fontSize`, `space`, `radius`, `duration`                                                |
| `src/styles/theme.css` | Biến CSS + `@theme` cho Tailwind v4; class như `bg-primary`, `text-status-pending`, `shadow-card`                                               |
| `src/components/`      | `button` (có `loading`), `input`, `password-input` (nút hiện/ẩn), `field-error`, `form-alert`, `textarea`, `label`, `card`, `badge`, `skeleton` |
| `src/hooks/`           | `use-zod-form`: form kiểm tra bằng schema Zod (web, admin; mobile có bản riêng vì khác bản React)                                               |

Còn cần thêm khi tới lúc dùng: `select dialog alert-dialog dropdown-menu table tabs sonner pagination avatar`.

## Thêm component

```bash
cd ui
pnpm dlx shadcn@4.23.0 add <ten>
```

Rồi chỉnh theo MASTER (skill `them-component-ui`). Preset `radix-nova` của shadcn khác MASTER ở nhiều chỗ: nút cao 32px, bo `rounded-xl`, focus mờ 50%, chữ ô nhập 14px, `leading-none` cắt dấu chữ hoa tiếng Việt.

## Kiểm tra

```bash
pnpm --filter @xom-nho/ui typecheck
pnpm --filter @xom-nho/ui lint
pnpm --filter @xom-nho/ui test      # tokens/*.ts và theme.css phải khớp từng mã màu
```
