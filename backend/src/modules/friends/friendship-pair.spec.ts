import { orderFriendPair } from "./friendship-pair.js";

describe("orderFriendPair", () => {
  it("cùng một cặp thì cho cùng một khóa, bất kể ai đứng trước", () => {
    expect(orderFriendPair("lan", "minh")).toEqual({ userLowId: "lan", userHighId: "minh" });
    expect(orderFriendPair("minh", "lan")).toEqual({ userLowId: "lan", userHighId: "minh" });
  });

  it("phân biệt hoa thường theo mã ký tự, không theo collation MySQL", () => {
    // "B" (66) đứng trước "a" (97); unicode_ci thì coi "a" < "B"
    expect(orderFriendPair("aXyz", "BXyz")).toEqual({ userLowId: "BXyz", userHighId: "aXyz" });
  });

  it("không ghép một người với chính mình", () => {
    expect(() => orderFriendPair("lan", "lan")).toThrow();
  });
});
