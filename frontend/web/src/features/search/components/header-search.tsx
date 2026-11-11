"use client";

import { LIMITS, SEARCH_MESSAGES } from "@xom-nho/api";
import { cn } from "@xom-nho/ui/lib/utils";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { searchHref } from "../lib/search-href";

const FORM_ID = "header-search";

/** Đang gõ trong ô nhập thì phím `/` là chữ, không phải phím tắt. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

const iconButtonClass =
  "glass-button inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors duration-200 hover:bg-glass-button-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/**
 * Ô tìm trong header (docs/tinh-nang.md mục 2.5), chỉ thành viên thấy. Từ 1024px luôn hiện; nhỏ hơn thì là nút
 * kính lúp, bấm vào ô tìm phủ ngang hàng trên của header. Enter thì sang `/tim-kiem?q=`; từ khóa rỗng không đi
 * đâu. Phím `/` đưa con trỏ vào ô, Esc đóng ô (điện thoại). Đang ở trang tìm kiếm thì ô giữ sẵn từ khóa.
 * Không có JavaScript form vẫn gửi GET tới `/tim-kiem`.
 */
export function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQ = pathname === "/tim-kiem" ? (searchParams.get("q") ?? "") : "";

  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  // Mở trên điện thoại thì đưa con trỏ vào ô sau khi ô hiện ra
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTyping(event.target)) return;
      event.preventDefault();
      setOpen(true);
      inputRef.current?.focus();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function close() {
    setOpen(false);
    openButtonRef.current?.focus();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    setOpen(false);
    inputRef.current?.blur();
    router.push(searchHref({ q }));
  }

  // Con trỏ rời khỏi ô (bấm ra ngoài, Tab đi chỗ khác) thì đóng ô trên điện thoại
  function onFieldBlur(event: FocusEvent<HTMLElement>) {
    if (!formRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  }

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        aria-label={SEARCH_MESSAGES.OPEN}
        aria-expanded={open}
        aria-controls={FORM_ID}
        onClick={() => setOpen(true)}
        className={cn(iconButtonClass, "lg:hidden")}
      >
        <Search aria-hidden="true" className="size-5" />
      </button>

      <search
        id={FORM_ID}
        className={cn(
          "items-center gap-2",
          // Điện thoại: phủ ngang hàng trên của thanh header (logo và các nút) khi mở
          open ? "absolute inset-x-1.5 top-1.5 z-10 flex rounded-full bg-card" : "hidden",
          "lg:static lg:z-auto lg:flex lg:w-56 lg:bg-transparent xl:w-72",
        )}
      >
        <form
          ref={formRef}
          action="/tim-kiem"
          method="get"
          onSubmit={onSubmit}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              ref={inputRef}
              key={currentQ}
              type="search"
              name="q"
              defaultValue={currentQ}
              maxLength={LIMITS.SEARCH_QUERY_MAX}
              placeholder={SEARCH_MESSAGES.PLACEHOLDER}
              aria-label={SEARCH_MESSAGES.INPUT_LABEL}
              aria-keyshortcuts="/"
              enterKeyHint="search"
              autoComplete="off"
              onKeyDown={onInputKeyDown}
              onBlur={onFieldBlur}
              className="h-10 w-full rounded-full border border-input/60 bg-transparent pr-4 pl-10 text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground hover:border-input focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            />
          </div>
          <button
            type="button"
            aria-label={SEARCH_MESSAGES.CLOSE}
            onClick={close}
            onBlur={onFieldBlur}
            className={cn(iconButtonClass, "lg:hidden")}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </form>
      </search>
    </>
  );
}
