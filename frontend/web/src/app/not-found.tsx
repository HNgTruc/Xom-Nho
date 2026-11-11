import { NotFoundState } from "@/components/common/not-found-state";
import { SiteHeader } from "@/components/layout/site-header";

// URL không khớp route nào: không đi qua layout (site), nên tự thêm header
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <NotFoundState />
    </>
  );
}
