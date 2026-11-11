import { WELCOME_MESSAGES } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { BookOpen, MessagesSquare, PenLine } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

const POINT_ICONS = [BookOpen, PenLine, MessagesSquare] as const;

/**
 * Trang chào mừng (docs/tinh-nang.md mục 2.0, ADR 0007): thứ duy nhất khách thấy. Tấm `glass-strong` lớn
 * giới thiệu xóm và hai nút, rồi ba tấm `glass` nói trong xóm có gì; các khối hiện ra lần lượt (MASTER mục 5).
 * Không đọc cookie hay dữ liệu: dựng sẵn lúc build.
 */
export function WelcomeView() {
  return (
    <main className="flex w-full flex-1 flex-col justify-center px-3 pt-6 pb-8 sm:px-4 md:px-6 md:pt-10 md:pb-12 lg:px-8">
      <div className="mx-auto flex w-full max-w-[860px] min-w-0 flex-col gap-4">
        <section
          aria-labelledby="welcome-title"
          className="glass-strong flex animate-rise-in flex-col items-start gap-5 rounded-xl p-6 sm:p-10 md:p-12"
        >
          <p className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
            {WELCOME_MESSAGES.EYEBROW}
          </p>
          <h1
            id="welcome-title"
            className="text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl md:leading-[1.1]"
          >
            {WELCOME_MESSAGES.TITLE}
          </h1>
          <p className="max-w-[56ch] text-base text-pretty text-muted-foreground sm:text-lg">
            {WELCOME_MESSAGES.INTRO}
          </p>
          <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dang-ky">{WELCOME_MESSAGES.JOIN}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dang-nhap">{WELCOME_MESSAGES.SIGN_IN}</Link>
            </Button>
          </div>
        </section>

        <ul className="grid gap-4 md:grid-cols-3">
          {WELCOME_MESSAGES.POINTS.map((point, index) => {
            const Icon = POINT_ICONS[index] ?? BookOpen;
            return (
              <li
                key={point.TITLE}
                className="glass flex animate-rise-in flex-col gap-3 rounded-xl p-5"
                style={{ "--stagger": index + 1 } as CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground"
                >
                  <Icon className="size-5" />
                </span>
                <h2 className="text-lg font-semibold">{point.TITLE}</h2>
                <p className="text-base text-muted-foreground">{point.TEXT}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
