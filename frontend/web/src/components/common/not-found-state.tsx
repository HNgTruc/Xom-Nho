import { ERROR_MESSAGES } from "@xom-nho/shared";
import { Button } from "@xom-nho/ui/components/button";
import Link from "next/link";

/** Trang 404 theo câu mẫu ở docs/giong-van-va-giao-dien.md, kèm đường về trang chủ. */
export function NotFoundState() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-start gap-4 px-4 py-16">
      <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
      <p className="text-base text-muted-foreground">{ERROR_MESSAGES.NOT_FOUND}</p>
      <Button asChild>
        <Link href="/">Về trang chủ</Link>
      </Button>
    </main>
  );
}
