import { useQuery } from "@tanstack/react-query";
import { Badge } from "@xom-nho/ui/components/badge";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { api } from "@/lib/api";

/** Cho biết admin có gọi được `GET /api/v1/health` không (kiểm tra cả CORS). */
export function BackendStatus() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => api.health.check(signal),
    retry: false,
  });

  if (health.isPending) return <Skeleton className="h-6 w-44" />;
  if (health.isError) return <Badge variant="destructive">Chưa kết nối được backend</Badge>;
  return <Badge variant="secondary">Đã kết nối backend</Badge>;
}
