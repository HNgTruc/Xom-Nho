import type { RouteObject } from "react-router";

// Dùng chung với màn Bài mới (features/moderation): hộp ẩn bài kèm lý do, thao tác ẩn/hiện/xóa có toast
export { HidePostDialog } from "./components/hide-post-dialog";
export { usePostActions } from "./hooks/use-post-actions";
export { adminPostsKeys } from "./api/posts.queries";

export const postsRoutes: RouteObject[] = [
  {
    path: "bai-viet",
    lazy: async () => ({ Component: (await import("./pages/posts-page")).PostsPage }),
  },
];
