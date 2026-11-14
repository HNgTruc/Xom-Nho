import type { RouteObject } from "react-router";

export const usersRoutes: RouteObject[] = [
  {
    path: "thanh-vien",
    lazy: async () => ({ Component: (await import("./pages/users-page")).UsersPage }),
  },
];
