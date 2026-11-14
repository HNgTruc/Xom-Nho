import type { RouteObject } from "react-router";

export const tagsRoutes: RouteObject[] = [
  {
    path: "the",
    lazy: async () => ({ Component: (await import("./pages/tags-page")).TagsPage }),
  },
];
