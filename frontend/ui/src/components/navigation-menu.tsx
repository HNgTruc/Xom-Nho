"use client";

// Radix NavigationMenu (gói radix-ui gộp), chỉnh theo MASTER: nút mở là viên thuốc như các mục điều hướng khác;
// bảng thả xuống là tấm `glass-bar` bo radius-xl, nằm ngay dưới nút (không dùng Viewport dùng chung).
// Rê chuột vào nút thì mở, rời cả nút lẫn bảng thì đóng; bấm (cảm ứng), Enter, Space, mũi tên xuống cũng mở được.

import * as React from "react";
import { cn } from "cn";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";
import { ChevronDownIcon } from "lucide-react";

function NavigationMenu({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn("relative", className)}
      {...props}
    />
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative shrink-0", className)}
      {...props}
    />
  );
}

/** Lớp chung cho viên điều hướng (link và nút mở): cao 44px trên điện thoại, 40px từ `sm`. */
const navigationMenuPillClass =
  "inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:h-10";

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuPillClass, "group cursor-pointer", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

/**
 * Bảng thả xuống: lớp ngoài trong suốt có `pt-2` làm cầu nối giữa nút và bảng, để rê chuột từ nút xuống
 * bảng không bị tính là rời khỏi menu.
 */
function NavigationMenuContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className="absolute top-full left-0 z-50 pt-2 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 motion-reduce:animate-none"
      {...props}
    >
      <div
        className={cn(
          "glass-bar max-w-[calc(100vw-1rem)] min-w-52 rounded-xl p-1.5 text-foreground shadow-glass-hover",
          className,
        )}
      >
        {children}
      </div>
    </NavigationMenuPrimitive.Content>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={className}
      {...props}
    />
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuPillClass,
};
