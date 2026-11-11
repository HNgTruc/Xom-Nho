import { NotFoundState } from "@/components/common/not-found-state";
import { SiteShell } from "@/components/layout/site-shell";

// URL không khớp route nào: không đi qua layout (site), nên tự bọc khung và header
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundState />
    </SiteShell>
  );
}
