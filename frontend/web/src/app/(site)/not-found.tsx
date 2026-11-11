import { NotFoundState } from "@/components/common/not-found-state";

// notFound() trong các trang công khai (bài viết, danh mục, tag, hồ sơ): vẫn có header của (site)
export default function SiteNotFound() {
  return <NotFoundState />;
}
