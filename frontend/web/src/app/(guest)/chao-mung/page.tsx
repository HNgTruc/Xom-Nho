import type { Metadata } from "next";
import { WelcomeView } from "@/features/auth";

// Khách mở `/` thì `proxy.ts` hiện trang này tại chỗ (URL vẫn là `/`), nên canonical là `/`
export const metadata: Metadata = {
  title: { absolute: "Xóm Nhỏ" },
  description:
    "Diễn đàn nhỏ để hàng xóm kể chuyện thường ngày, hỏi han nhau và chia sẻ điều mình biết.",
  alternates: { canonical: "/" },
};

export default function WelcomePage() {
  return <WelcomeView />;
}
