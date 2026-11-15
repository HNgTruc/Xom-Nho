import { describe, expect, it } from "vitest";
import { toRelationshipStatus } from "./friendship.js";

describe("toRelationshipStatus", () => {
  it("giữ nguyên giá trị đã biết", () => {
    expect(toRelationshipStatus("friends")).toBe("friends");
    expect(toRelationshipStatus("incoming")).toBe("incoming");
  });

  it("giá trị lạ từ backend mới hơn thì coi như none", () => {
    expect(toRelationshipStatus("following")).toBe("none");
    expect(toRelationshipStatus("")).toBe("none");
  });
});
