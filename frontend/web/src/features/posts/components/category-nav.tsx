import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { getCategories } from "../api/get-category";
import { CategoryNavLinks } from "./category-nav-links";

/** Điều hướng chính trong header: "Trang chủ" rồi các danh mục. Backend lỗi thì chỉ còn "Trang chủ". */
export async function CategoryNav() {
  const categories = await getCategories().catch(() => []);
  const items = [
    { href: "/", label: "Trang chủ" },
    ...categories.map((category) => ({
      href: `/danh-muc/${category.slug}`,
      label: category.name,
    })),
  ];

  return (
    <nav aria-label="Điều hướng chính" className="min-w-0">
      <CategoryNavLinks items={items} />
    </nav>
  );
}

export function CategoryNavSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-1">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-24 rounded-full" />
      ))}
    </div>
  );
}
