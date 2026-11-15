import type { UserSummary } from "@xom-nho/api";
import type { PairPeopleRow, SummaryRow } from "./friends.repository.js";

// Map từng trường: thêm cột vào `select` (ví dụ `email`) không tự lọt ra API

export function toUserSummary(row: SummaryRow): UserSummary {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    image: row.image,
    avatarId: row.avatarId,
  };
}

/** Người còn lại của cặp, nhìn từ phía `viewerId`. */
export function otherPerson(row: PairPeopleRow, viewerId: string): UserSummary {
  return toUserSummary(row.userLow.id === viewerId ? row.userHigh : row.userLow);
}
