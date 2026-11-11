import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import "@/styles/globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

const lora = Lora({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  // Gốc cho URL tuyệt đối trong Open Graph, canonical (.env.example: SITE_URL)
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: "Xóm Nhỏ", template: "%s · Xóm Nhỏ" },
  description: "Diễn đàn nhỏ để hàng xóm chia sẻ chuyện thường ngày.",
  // Trang nào tự đặt openGraph thì phải ghi lại hai trường này (Next không gộp sâu)
  openGraph: { siteName: "Xóm Nhỏ", locale: "vi_VN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
