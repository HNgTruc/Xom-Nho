import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import { displayPreferencesScript } from "@xom-nho/ui/lib/display-preferences";
import { SiteBackdrop } from "@/components/layout/site-backdrop";
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
    // Script trong <head> đổi class `dark` và data-* của <html> trước khi trang vẽ (Hiển thị và trợ năng),
    // nên giá trị trên <html> khác bản server render: báo React bỏ qua chênh lệch ở riêng thẻ này.
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Nội dung cố định từ ui, không có dữ liệu người dùng */}
        <script dangerouslySetInnerHTML={{ __html: displayPreferencesScript }} />
      </head>
      <body>
        <SiteBackdrop />
        {children}
      </body>
    </html>
  );
}
