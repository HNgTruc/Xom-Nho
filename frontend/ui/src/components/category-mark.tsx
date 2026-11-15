import { cn } from "cn";
import { CategoryIcon, isCategoryIconName } from "@xom-nho/ui/components/category-icon";

// Khóa màu phải khớp CATEGORY_COLORS trong api/src/constants/category-colors.ts (ui không import api).
type CategoryColorName = "amber" | "blue" | "green" | "purple" | "rose";
const FALLBACK: CategoryColorName = "amber";

// Viết đủ tên class (không ghép chuỗi) để Tailwind tìm thấy. Màu và tương phản: MASTER mục 2.2.
// Hover giữ nguyên nền (đổi nền sẽ mất màu danh mục), badge tự gạch chân để báo bấm được.
const BADGE_CLASS: Record<CategoryColorName, string> = {
  amber: "bg-category-amber-bg text-category-amber hover:bg-category-amber-bg",
  blue: "bg-category-blue-bg text-category-blue hover:bg-category-blue-bg",
  green: "bg-category-green-bg text-category-green hover:bg-category-green-bg",
  purple: "bg-category-purple-bg text-category-purple hover:bg-category-purple-bg",
  rose: "bg-category-rose-bg text-category-rose hover:bg-category-rose-bg",
};

const DOT_CLASS: Record<CategoryColorName, string> = {
  amber: "bg-category-amber",
  blue: "bg-category-blue",
  green: "bg-category-green",
  purple: "bg-category-purple",
  rose: "bg-category-rose",
};

// Ô biểu tượng danh mục: nền badge, biểu tượng màu chữ danh mục (cặp màu đã tính tương phản, MASTER 2.2)
const TILE_CLASS: Record<CategoryColorName, string> = {
  amber: "bg-category-amber-bg text-category-amber",
  blue: "bg-category-blue-bg text-category-blue",
  green: "bg-category-green-bg text-category-green",
  purple: "bg-category-purple-bg text-category-purple",
  rose: "bg-category-rose-bg text-category-rose",
};

/** Màu lạ (backend thêm màu mới mà frontend chưa biết) thì về màu mặc định, không vỡ giao diện. */
function toColor(color: string): CategoryColorName {
  return color in BADGE_CLASS ? (color as CategoryColorName) : FALLBACK;
}

function categoryBadgeClass(color: string): string {
  return BADGE_CLASS[toColor(color)];
}

function categoryDotClass(color: string): string {
  return DOT_CLASS[toColor(color)];
}

function categoryTileClass(color: string): string {
  return TILE_CLASS[toColor(color)];
}

const SIZE_CLASS = {
  // Menu Chủ đề, danh sách ở admin: ô 32px, biểu tượng 20px
  sm: { tile: "size-8 rounded-md", icon: "size-5", dot: "size-2.5" },
  // Đầu trang danh mục: ô 56px, biểu tượng 30px
  lg: { tile: "size-14 rounded-lg", icon: "size-7.5", dot: "size-3.5" },
} as const;

/**
 * Ô biểu tượng của danh mục (MASTER mục 6 "Biểu tượng danh mục"): nền badge, biểu tượng màu chữ danh mục.
 * Danh mục chưa có biểu tượng (hoặc khóa chưa biết) thì trong ô là chấm màu. Hình trang trí: tên danh mục luôn
 * đi kèm bằng chữ. Dùng ở web (menu Chủ đề, đầu trang danh mục) và admin (màn Danh mục, phần xem trước).
 */
function CategoryMark({
  color,
  icon,
  size = "sm",
  className,
}: {
  color: string;
  icon: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  const sizes = SIZE_CLASS[size];
  return (
    <span
      aria-hidden="true"
      data-slot="category-mark"
      className={cn(
        "grid shrink-0 place-items-center",
        sizes.tile,
        categoryTileClass(color),
        className,
      )}
    >
      {icon && isCategoryIconName(icon) ? (
        <CategoryIcon icon={icon} className={sizes.icon} />
      ) : (
        <span className={cn("rounded-full", sizes.dot, categoryDotClass(color))} />
      )}
    </span>
  );
}

export { CategoryMark, categoryBadgeClass, categoryDotClass, categoryTileClass };
