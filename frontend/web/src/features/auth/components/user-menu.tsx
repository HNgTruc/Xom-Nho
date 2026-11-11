"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@xom-nho/ui/components/dropdown-menu";
import { LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/initials";

export interface UserMenuUser {
  name: string;
  username: string | null;
  image: string | null;
}

/**
 * Menu tài khoản ở header (docs/tinh-nang.md mục 1.4): bấm ảnh đại diện mở menu kính gồm Hồ sơ, Cài đặt,
 * Đăng xuất. Radix lo bàn phím (mũi tên, Esc) và focus; nút có nhãn tiếng Việt vì chỉ có ảnh.
 * Chưa có username (tài khoản cũ, đăng nhập mạng xã hội) thì ẩn mục Hồ sơ.
 */
export function UserMenu({ user }: { user: UserMenuUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await authClient.signOut();
    router.refresh();
    setPending(false);
  }

  return (
    <DropdownMenu>
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

      <DropdownMenuContent align="end" sideOffset={8}>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
