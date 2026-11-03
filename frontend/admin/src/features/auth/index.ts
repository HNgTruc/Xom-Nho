import type { RouteObject } from "react-router";

export { meQuery } from "./api/me.queries";
export { SignOutButton } from "./components/sign-out-button";

export const authRoutes: RouteObject[] = [
  {
    path: "dang-nhap",
    lazy: async () => ({ Component: (await import("./pages/sign-in-page")).SignInPage }),
  },
];
