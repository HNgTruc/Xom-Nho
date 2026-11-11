"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@xom-nho/ui/components/dropdown-menu";
import { useDisplayPreferences } from "@xom-nho/ui/hooks/use-display-preferences";
import type { DisplayPreferences } from "@xom-nho/ui/lib/display-preferences";
import { ArrowLeft, ChevronRight, LogOut, Moon, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/initials";

export interface UserMenuUser {
  name: string;
  username: string | null;
  image: string | null;
}

type View = "main" | "display";

interface DisplayOption<K extends keyof DisplayPreferences> {
  key: K;
  title: string;
  description: string;
  options: { value: DisplayPreferences[K]; label: string; hint?: string }[];
}

// Ba mục của "Hiển thị và trợ năng" (docs/tinh-nang.md mục 1.6). "Tự động" theo cài đặt của thiết bị.
const DISPLAY_OPTIONS = [
  {
    key: "theme",
    title: "Chế độ tối",
    description: "Đổi nền sang tối cho đỡ chói mắt khi trời tối.",
    options: [
      { value: "light", label: "Tắt" },
      { value: "dark", label: "Bật" },
      { value: "system", label: "Tự động", hint: "Theo thiết bị" },
    ],
  } satisfies DisplayOption<"theme">,
  {
    key: "transparency",
    title: "Hiệu ứng kính",
    description: "Nền trong suốt nhìn xuyên ra ảnh. Tắt nếu máy chạy chậm hoặc khó đọc chữ.",
    options: [
      { value: "system", label: "Tự động", hint: "Theo thiết bị" },
      { value: "on", label: "Luôn bật" },
      { value: "off", label: "Tắt" },
    ],
  } satisfies DisplayOption<"transparency">,
  {
    key: "motion",
    title: "Giảm chuyển động",
    description: "Bỏ hiệu ứng hiện dần khi tải trang và nổi lên khi rê chuột.",
    options: [
      { value: "system", label: "Tự động", hint: "Theo thiết bị" },
      { value: "reduce", label: "Bật" },
    ],
  } satisfies DisplayOption<"motion">,
] as const;

/**
 * Menu tài khoản ở header (docs/tinh-nang.md mục 1.4, 1.6): bấm ảnh đại diện mở menu kính gồm Hồ sơ, Cài đặt,
 * Hiển thị và trợ năng, Đăng xuất. "Hiển thị và trợ năng" chuyển sang trang con có nút quay lại; chọn tùy chọn
 * không đóng menu để đổi nhiều mục liền nhau. Radix lo bàn phím (mũi tên, Esc); đổi trang con thì đưa focus
 * vào mục đầu tiên. Chưa có username thì ẩn mục Hồ sơ.
 */
export function UserMenu({ user }: { user: UserMenuUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [view, setView] = useState<View>("main");
  const contentRef = useRef<HTMLDivElement>(null);
  const { preferences, update } = useDisplayPreferences();

  // Mục đang có focus bị gỡ khi đổi trang con: đưa focus vào mục đầu tiên của trang mới
  useEffect(() => {
    contentRef.current
      ?.querySelector<HTMLElement>('[role="menuitem"], [role="menuitemradio"]')
      ?.focus();
  }, [view]);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.refresh();
    setPending(false);
  }

  return (
    <DropdownMenu onOpenChange={(open) => !open && setView("main")}>
      <DropdownMenuTrigger
        aria-label={`Tài khoản của ${user.name}`}
        className="glass-button flex h-10 items-center gap-2 rounded-full py-1 pr-1 pl-3 text-sm font-medium transition-colors duration-200 hover:bg-glass-button-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[state=open]:bg-glass-button-hover"
      >
        <span className="hidden max-w-40 truncate sm:inline">{user.name}</span>
        <Avatar size="sm" className="size-8">
          {user.image && <AvatarImage src={user.image} alt="" />}
          <AvatarFallback>{initials(user.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        ref={contentRef}
        align="end"
        sideOffset={8}
        className="w-80 max-w-[calc(100vw-1rem)]"
      >
        {view === "main" ? (
          <>
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate text-base font-semibold text-foreground">{user.name}</span>
              {user.username && <span className="truncate">@{user.username}</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.username && (
              <DropdownMenuItem asChild>
                <Link href={`/u/${user.username}`}>
                  <UserRound aria-hidden="true" />
                  Hồ sơ
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href="/cai-dat">
                <Settings aria-hidden="true" />
                Cài đặt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setView("display");
              }}
            >
              <Moon aria-hidden="true" />
              Hiển thị và trợ năng
              <ChevronRight aria-hidden="true" className="ml-auto" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={pending}
              onSelect={(event) => {
                event.preventDefault();
                void signOut();
              }}
            >
              <LogOut aria-hidden="true" />
              {pending ? "Đang đăng xuất…" : "Đăng xuất"}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              aria-label="Quay lại menu tài khoản"
              className="font-semibold"
              onSelect={(event) => {
                event.preventDefault();
                setView("main");
              }}
            >
              <ArrowLeft aria-hidden="true" />
              Hiển thị và trợ năng
            </DropdownMenuItem>

            {DISPLAY_OPTIONS.map((group) => (
              <Fragment key={group.key}>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span
                    id={`display-${group.key}`}
                    className="text-base font-semibold text-foreground"
                  >
                    {group.title}
                  </span>
                  <span className="font-normal">{group.description}</span>
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  aria-labelledby={`display-${group.key}`}
                  value={preferences[group.key]}
                  onValueChange={(value) => update({ [group.key]: value })}
                >
                  {group.options.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {option.label}
                      {"hint" in option && option.hint && (
                        <span className="text-sm text-muted-foreground">{option.hint}</span>
                      )}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </Fragment>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
