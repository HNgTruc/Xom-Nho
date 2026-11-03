import { createBrowserRouter } from "react-router";
import { authRoutes } from "@/features/auth";
import { dashboardRoutes } from "@/features/dashboard";
import { RequireAdmin } from "./require-admin";

// Chỉ ghép route của các feature. TODO(giai đoạn 5): AdminLayout (sidebar, topbar) bên trong RequireAdmin.
export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/",
    Component: RequireAdmin,
    children: [...dashboardRoutes],
  },
]);
