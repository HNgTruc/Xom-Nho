import type * as React from "react";
import { cn } from "cn";

// Biểu tượng điều hướng và danh mục (MASTER mục 6 "Biểu tượng danh mục"). Lưới 24, nét 2, đầu nét và góc tròn
// như Lucide để đứng cạnh các biểu tượng khác; mỗi danh mục là một đồ vật quen trong nhà, có một nét cong chữ S
// cùng họ với logo chữ ký. Tô bằng currentColor: màu do nơi dùng đặt (màu chữ danh mục, MASTER mục 2.2).

type IconProps = Omit<React.ComponentProps<"svg">, "children">;

function Glyph({ className, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn("size-5 shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

// Khóa phải khớp CATEGORY_ICONS trong api/src/constants/category-icons.ts (ui không import api).
const categoryGlyphs = {
  // Chén trà bốc khói
  tea: (
    <>
      <path d="M4.5 11h12v2.25a6 6 0 0 1-12 0Z" />
      <path d="M16.5 12.25h1a2.4 2.4 0 0 1 0 4.8h-1.6" />
      <path d="M3.5 21.5h14" />
      <path d="M8.5 3c-1.3 1.3 1.3 2.7 0 4.5M12.5 3c-1.3 1.3 1.3 2.7 0 4.5" />
    </>
  ),
  // Con chip, mạch bên trong uốn chữ S
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <path d="M10 2.75V6M14 2.75V6M10 18v3.25M14 18v3.25M2.75 10H6M2.75 14H6M18 10h3.25M18 14h3.25" />
      <path d="M10 14.5c0-2.5 4-2 4-5" />
    </>
  ),
  // Quyển vở mở
  notebook: (
    <>
      <path d="M12 7C10.2 5.6 7.4 5 4 5.3v13c3.4-.3 6.2.3 8 1.7 1.8-1.4 4.6-2 8-1.7v-13C16.6 5 13.8 5.6 12 7Z" />
      <path d="M12 7v13" />
    </>
  ),
  // Trăng khuyết và một vì sao
  moon: (
    <>
      <path d="M19.5 14.2A8 8 0 1 1 9.8 4.5a6.3 6.3 0 0 0 9.7 9.7Z" />
      <path d="M17.5 3v3.5M15.75 4.75h3.5" />
    </>
  ),
  // Bong bóng trò chuyện có dấu hỏi
  question: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 1-4.25 15.86L3.5 20.5l1.14-4.25A8.5 8.5 0 0 1 12 3.5Z" />
      <path d="M9.6 9.8a2.5 2.5 0 0 1 4.85.8c0 1.6-2.45 2-2.45 3.6" />
      <path d="M12 17.2h.01" />
    </>
  ),
} as const;

type CategoryIconName = keyof typeof categoryGlyphs;

function isCategoryIconName(value: string): value is CategoryIconName {
  return Object.hasOwn(categoryGlyphs, value);
}

/**
 * Biểu tượng của một danh mục. `icon` không có hoặc là khóa lạ thì không vẽ gì (trả `null`):
 * nơi dùng tự hiện chấm màu thay thế. Luôn là hình trang trí, tên danh mục đi kèm bằng chữ.
 */
function CategoryIcon({ icon, ...props }: IconProps & { icon: string | null | undefined }) {
  if (!icon || !isCategoryIconName(icon)) return null;
  return (
    <Glyph data-slot="category-icon" data-icon={icon} {...props}>
      {categoryGlyphs[icon]}
    </Glyph>
  );
}

/** Trang chủ: bảng tin, tấm bài phía trước và mép tấm bài sau. */
function HomeFeedIcon(props: IconProps) {
  return (
    <Glyph data-slot="home-feed-icon" {...props}>
      <path d="M7 3.5h10" />
      <rect x="3.5" y="7" width="17" height="13.5" rx="3" />
      <path d="M7.5 11.5h9M7.5 15.5h5.5" />
    </Glyph>
  );
}

/** Chủ đề: ba ô vuông và một ô tròn. */
function TopicsIcon(props: IconProps) {
  return (
    <Glyph data-slot="topics-icon" {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <circle cx="17" cy="17" r="3.5" />
    </Glyph>
  );
}

export { CategoryIcon, HomeFeedIcon, TopicsIcon, isCategoryIconName };
export type { CategoryIconName };
