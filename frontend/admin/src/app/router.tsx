import { createBrowserRouter } from "react-router";
import { authRoutes } from "@/features/auth";
import { categoriesRoutes } from "@/features/categories";
import { commentsRoutes } from "@/features/comments";
import { dashboardRoutes } from "@/features/dashboard";
import { moderationRoutes } from "@/features/moderation";
import { postsRoutes } from "@/features/posts";
import { tagsRoutes } from "@/features/tags";
import { usersRoutes } from "@/features/users";
import { AdminLayout } from "./layout/admin-layout";
import { RequireAdmin } from "./require-admin";

// Chỉ ghép route của các feature (mỗi trang lazy load). Mọi trang quản trị nằm trong RequireAdmin → AdminLayout.
export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/",
    Component: RequireAdmin,
    children: [
      {
        Component: AdminLayout,
        children: [
          ...dashboardRoutes,
          ...moderationRoutes,
          ...postsRoutes,
          ...commentsRoutes,
          ...categoriesRoutes,
          ...tagsRoutes,
          ...usersRoutes,
        ],
      },
    ],
  },
]);
