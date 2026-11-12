import { CategoryIcon, isCategoryIconName } from "@xom-nho/ui/components/category-icon";
import { cn } from "@xom-nho/ui/lib/utils";
import { categoryDotClass, categoryTileClass } from "../lib/category-color";

const SIZE_CLASS = {
  // Menu Chủ đề: ô 32px, biểu tượng 20px
  sm: { tile: "size-8 rounded-md", icon: "size-5", dot: "size-2.5" },
  // Đầu trang danh mục: ô 56px, biểu tượng 30px
  lg: { tile: "size-14 rounded-lg", icon: "size-7.5", dot: "size-3.5" },
} as const;

/**
 * Ô biểu tượng của danh mục (MASTER mục 6 "Biểu tượng danh mục"): nền badge, biểu tượng màu chữ danh mục.
 * Danh mục chưa có biểu tượng (hoặc khóa web chưa biết) thì trong ô là chấm màu như trước.
 * Hình trang trí: tên danh mục luôn đi kèm bằng chữ.
 */
export function CategoryMark({
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
