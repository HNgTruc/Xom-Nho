"use client";

import { INBOX_MESSAGES } from "@xom-nho/api";
import { MessagesSquare } from "lucide-react";
import { HeaderPanel } from "@/components/layout/header-panel";

/**
 * Nút Tin nhắn ở header (docs/tinh-nang.md mục 5). Backend tin nhắn làm ở giai đoạn 4c nên bảng luôn trống;
 * khi có API, truyền `unread` và các cuộc trò chuyện gần nhất vào `HeaderPanel`, thêm liên kết `/tin-nhan`.
 */
export function MessagesMenu() {
  return (
    <HeaderPanel
      label={INBOX_MESSAGES.TITLE}
      title={INBOX_MESSAGES.TITLE}
      icon={<MessagesSquare aria-hidden="true" />}
      emptyMessage={INBOX_MESSAGES.EMPTY}
    />
  );
}
