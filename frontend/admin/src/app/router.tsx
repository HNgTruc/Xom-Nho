import { createBrowserRouter } from "react-router";
import { dashboardRoutes } from "@/features/dashboard";

// Chỉ ghép route của các feature. TODO(giai đoạn 2): bọc bằng require-admin; giai đoạn 5: AdminLayout.
export const router = createBrowserRouter([
  {
    path: "/",
    children: [...dashboardRoutes],
  },
]);
