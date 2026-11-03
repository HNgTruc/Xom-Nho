import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Đọc alias "@/*" trong tsconfig.app.json (Vite 8)
  resolve: { tsconfigPaths: true },
  server: { port: 5173, strictPort: true },
});
