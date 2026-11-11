import { ERROR_MESSAGES } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import Link from "next/link";

/** Trang 404 theo câu mẫu ở docs/giong-van-va-giao-dien.md, kèm đường về trang chủ. */
export function NotFoundState() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <div className="glass-strong flex animate-rise-in flex-col items-start gap-4 rounded-xl p-6">
        <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
        <p className="text-base text-muted-foreground">{ERROR_MESSAGES.NOT_FOUND}</p>
        <Button asChild>
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </main>
  );
}
