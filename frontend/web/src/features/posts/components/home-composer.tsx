import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { requireUser } from "@/features/auth";
import { getCategories } from "../api/get-category";
import { PostComposer } from "./post-composer";

/**
 * Tấm tạo bài ở đầu trang chủ (thay tấm "Bài viết trong xóm"). Đọc phiên nên nằm trong `<Suspense>`; cookie còn
 * mà phiên đã hết thì sang đăng nhập. Danh mục lỗi thì vẫn hiện tấm, hộp soạn báo chọn danh mục.
 */
export async function HomeComposer() {
  const [user, categories] = await Promise.all([requireUser("/"), getCategories().catch(() => [])]);
  return <PostComposer user={{ name: user.name, image: user.image }} categories={categories} />;
}

export function HomeComposerSkeleton() {
  return (
    <div aria-hidden="true" className="glass flex flex-col gap-3 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-11 flex-1 rounded-full" />
      </div>
      <Skeleton className="h-10 w-32 rounded-full" />
    </div>
  );
}
