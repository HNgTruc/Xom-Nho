import { Badge } from "@xom-nho/ui/components/badge";
import { serverApi } from "@/lib/server-api";

async function isBackendUp(): Promise<boolean> {
  try {
    await serverApi.health.check();
    return true;
  } catch {
    return false;
  }
}

/** Cho biết web có gọi được `GET /api/v1/health` không. Gọi lúc có request, nên phải đặt trong `<Suspense>`. */
export async function BackendStatus() {
  return (await isBackendUp()) ? (
    <Badge variant="secondary">Đã kết nối backend</Badge>
  ) : (
    <Badge variant="destructive">Chưa kết nối được backend</Badge>
  );
}
