import { FriendsPolicy, type RelationshipFacts } from "./friends.policy.js";

function facts(overrides: Partial<RelationshipFacts> = {}): RelationshipFacts {
  return {
    viewerId: "lan",
    targetId: "minh",
    targetBanned: false,
    friendship: null,
    blockedByMe: false,
    blockedByThem: false,
    ...overrides,
  };
}

const pending = (requesterId: string) => ({ requesterId, status: "PENDING" as const });
const accepted = { requesterId: "minh", status: "ACCEPTED" as const };

describe("FriendsPolicy.status", () => {
  it("hồ sơ của chính mình là self", () => {
    expect(FriendsPolicy.status(facts({ targetId: "lan" }))).toBe("self");
  });

  it("chưa có dòng friendship là none", () => {
    expect(FriendsPolicy.status(facts())).toBe("none");
  });

  it("mình gửi lời mời là outgoing, người kia gửi là incoming", () => {
    expect(FriendsPolicy.status(facts({ friendship: pending("lan") }))).toBe("outgoing");
    expect(FriendsPolicy.status(facts({ friendship: pending("minh") }))).toBe("incoming");
  });

  it("đã chấp nhận là friends, bất kể ai gửi lời mời", () => {
    expect(FriendsPolicy.status(facts({ friendship: accepted }))).toBe("friends");
    expect(
      FriendsPolicy.status(facts({ friendship: { requesterId: "lan", status: "ACCEPTED" } })),
    ).toBe("friends");
  });
});

describe("FriendsPolicy.canRequest", () => {
  it("chưa có quan hệ thì gửi được lời mời", () => {
    expect(FriendsPolicy.canRequest(facts())).toBe(true);
  });

  it("người kia đã mời thì chấp nhận được", () => {
    expect(FriendsPolicy.canRequest(facts({ friendship: pending("minh") }))).toBe(true);
  });

  it("đã mời rồi, đã là bạn, hay là chính mình thì không còn gì để bấm", () => {
    expect(FriendsPolicy.canRequest(facts({ friendship: pending("lan") }))).toBe(false);
    expect(FriendsPolicy.canRequest(facts({ friendship: accepted }))).toBe(false);
    expect(FriendsPolicy.canRequest(facts({ targetId: "lan" }))).toBe(false);
  });

  it("người kia đang bị cấm thì không gửi, không chấp nhận được", () => {
    expect(FriendsPolicy.canRequest(facts({ targetBanned: true }))).toBe(false);
    expect(
      FriendsPolicy.canRequest(facts({ targetBanned: true, friendship: pending("minh") })),
    ).toBe(false);
  });

  it("có lượt chặn ở bất kỳ chiều nào thì không gửi được", () => {
    expect(FriendsPolicy.canRequest(facts({ blockedByMe: true }))).toBe(false);
    expect(FriendsPolicy.canRequest(facts({ blockedByThem: true }))).toBe(false);
    expect(
      FriendsPolicy.canRequest(facts({ blockedByThem: true, friendship: pending("minh") })),
    ).toBe(false);
  });
});

describe("FriendsPolicy.canBlock", () => {
  it("chặn được người khác, kể cả trưởng xóm (vai trò không ảnh hưởng)", () => {
    expect(FriendsPolicy.canBlock("lan", "truongxom")).toBe(true);
  });

  it("không chặn chính mình", () => {
    expect(FriendsPolicy.canBlock("lan", "lan")).toBe(false);
  });
});
