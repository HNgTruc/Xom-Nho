"use client";

import { NOTIFICATION_MESSAGES } from "@xom-nho/api";
import { Bell } from "lucide-react";
import { HeaderPanel } from "@/components/layout/header-panel";

/**
 * Nút Thông báo ở header (docs/tinh-nang.md mục 6). Backend chưa có thông báo nên bảng luôn trống;
 * khi có API, truyền `unread` và danh sách thông báo vào `HeaderPanel`.
 */
export function NotificationsMenu() {
  return (
    <HeaderPanel
      label={NOTIFICATION_MESSAGES.TITLE}
      title={NOTIFICATION_MESSAGES.TITLE}
      icon={<Bell aria-hidden="true" />}
      emptyMessage={NOTIFICATION_MESSAGES.EMPTY}
    />
  );
}
