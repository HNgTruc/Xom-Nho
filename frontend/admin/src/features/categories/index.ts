import type { RouteObject } from "react-router";

export const categoriesRoutes: RouteObject[] = [
  {
    path: "danh-muc",
    lazy: async () => ({ Component: (await import("./pages/categories-page")).CategoriesPage }),
  },
];
