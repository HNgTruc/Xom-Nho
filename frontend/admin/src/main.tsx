import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@/styles/globals.css";
import {
  applyDisplayPreferences,
  readDisplayPreferences,
} from "@xom-nho/ui/lib/display-preferences";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { Providers } from "@/app/providers";
import { router } from "@/app/router";

// Chế độ tối, giảm trong suốt, giảm chuyển động (MASTER 2.4, chung bộ khóa với web): áp lên <html> trước khi vẽ
applyDisplayPreferences(readDisplayPreferences());

const root = document.getElementById("root");
if (!root) throw new Error("Thiếu phần tử #root trong index.html");

createRoot(root).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
