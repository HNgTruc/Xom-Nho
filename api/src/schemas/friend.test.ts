import { describe, expect, it } from "vitest";
import { friendsPageQuerySchema, listFriendRequestsQuerySchema } from "./friend.js";

describe("friendsPageQuerySchema", () => {
  it("mặc định trang 1, 20 người một trang", () => {
    expect(friendsPageQuerySchema.parse({})).toEqual({ page: 1, pageSize: 20 });
  });

  it("ép chuỗi từ URL sang số, chặn quá 50 người một trang", () => {
    expect(friendsPageQuerySchema.parse({ page: "2", pageSize: "5" })).toEqual({
      page: 2,
      pageSize: 5,
    });
    expect(friendsPageQuerySchema.safeParse({ pageSize: "51" }).success).toBe(false);
  });
});

describe("listFriendRequestsQuerySchema", () => {
  it("mặc định lời mời nhận được", () => {
    expect(listFriendRequestsQuerySchema.parse({}).direction).toBe("incoming");
  });

  it("nhận outgoing, từ chối giá trị lạ", () => {
    expect(listFriendRequestsQuerySchema.parse({ direction: "outgoing" }).direction).toBe(
      "outgoing",
    );
    expect(
      listFriendRequestsQuerySchema.safeParse({ direction: "all" }).error?.issues[0]?.message,
    ).toBe("Loại lời mời không hợp lệ");
  });
});
