"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuPillClass,
} from "@xom-nho/ui/components/navigation-menu";
import { HomeFeedIcon, TopicsIcon } from "@xom-nho/ui/components/category-icon";
import { cn } from "@xom-nho/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type PointerEvent, useRef, useState } from "react";
import { CategoryMark } from "./category-mark";

export interface CategoryNavItem {
  href: string;
  label: string;
  color: string;
  icon: string | null;
}

const TOPICS_VALUE = "chu-de";

/**
 * Điều hướng chính trong header (MASTER mục 8): viên "Trang chủ" và viên "Chủ đề"; rê chuột (hoặc bấm) vào
 * "Chủ đề" thì danh sách danh mục thả xuống. Đang xem trang chủ hay một danh mục thì viên tương ứng là `primary`.
 * Client component chỉ để đọc đường dẫn hiện tại; danh sách danh mục do server truyền vào.
 */
export function CategoryNavLinks({ categories }: { categories: CategoryNavItem[] }) {
  const pathname = usePathname();
  const [value, setValue] = useState("");
  const pointerTypeRef = useRef("");
  const homeActive = pathname === "/";
  const topicActive = categories.some((category) => pathname === category.href);

  return (
    <NavigationMenu aria-label="Điều hướng chính" value={value} onValueChange={setValue}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink asChild active={homeActive}>
            <Link href="/" className={pillClass(homeActive)}>
              <HomeFeedIcon className="size-4.5" />
              Trang chủ
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {categories.length > 0 && (
          <NavigationMenuItem value={TOPICS_VALUE}>
            <NavigationMenuTrigger
              className={cn(
                pillClass(topicActive),
                !topicActive && "data-[state=open]:bg-glass-button-hover",
              )}
              onPointerDown={(event: PointerEvent) => {
                pointerTypeRef.current = event.pointerType;
              }}
              onClick={(event) => {
                // Rê chuột đã mở bảng rồi bấm thêm thì giữ bảng mở (Radix mặc định bấm là đóng lại).
                // Bàn phím, cảm ứng vẫn bấm để mở/đóng như thường.
                if (value === TOPICS_VALUE && pointerTypeRef.current === "mouse") {
                  event.preventDefault();
                }
                pointerTypeRef.current = "";
              }}
            >
              <TopicsIcon className="size-4.5" />
              Chủ đề
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="flex flex-col gap-0.5">
                {categories.map((category) => {
                  const active = pathname === category.href;
                  return (
                    <li key={category.href}>
                      <NavigationMenuLink asChild active={active}>
                        <Link
                          href={category.href}
                          className={cn(
                            "flex min-h-11 items-center gap-3 rounded-md py-1.5 pr-3 pl-1.5 text-base text-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                            active && "font-semibold",
                          )}
                        >
                          <CategoryMark color={category.color} icon={category.icon} />
                          {category.label}
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function pillClass(active: boolean) {
  return cn(
    navigationMenuPillClass,
    active ? "glass-primary" : "text-foreground hover:bg-glass-button-hover",
  );
}
