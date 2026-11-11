import type { CategoryRef } from "@xom-nho/api";
import { Badge } from "@xom-nho/ui/components/badge";
import { cn } from "@xom-nho/ui/lib/utils";
import Link from "next/link";
import { categoryBadgeClass } from "../lib/category-color";

/** Badge danh mục: màu chỉ là tín hiệu phụ, luôn có tên bằng chữ (MASTER mục 2.2). Bấm vào mở trang danh mục. */
export function CategoryBadge({
  category,
  className,
}: {
  category: CategoryRef;
  className?: string;
}) {
  return (
    <Badge
      asChild
      variant="ghost"
      className={cn(
        "underline-offset-2 hover:underline",
        categoryBadgeClass(category.color),
        className,
      )}
    >
      <Link href={`/danh-muc/${category.slug}`}>{category.name}</Link>
    </Badge>
  );
}
