import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { getCategories } from "../api/get-category";
import { CategoryNavLinks } from "./category-nav-links";

/** Điều hướng chính trong header: "Trang chủ" và "Chủ đề" (thả xuống các danh mục). Backend lỗi thì chỉ còn "Trang chủ". */
export async function CategoryNav() {
  const categories = await getCategories().catch(() => []);

  return (
    <CategoryNavLinks
      categories={categories.map((category) => ({
        href: `/danh-muc/${category.slug}`,
        label: category.name,
        color: category.color,
      }))}
    />
  );
}

export function CategoryNavSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-1">
      <Skeleton className="h-10 w-24 rounded-full" />
      <Skeleton className="h-10 w-24 rounded-full" />
    </div>
  );
}
