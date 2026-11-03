import { bannedMessage, isBanned, toSessionUser } from "./session-user.js";

const base = { id: "u1", name: "Lan", email: "lan@x.vn", username: "lan" };
const now = new Date("2026-11-03T00:00:00Z");

describe("isBanned", () => {
  it("không cấm thì false", () => {
    expect(isBanned({ ...base, banned: false }, now)).toBe(false);
    expect(isBanned({ ...base, banned: null }, now)).toBe(false);
  });

  it("cấm không có hạn thì cấm vĩnh viễn", () => {
    expect(isBanned({ ...base, banned: true, banExpires: null }, now)).toBe(true);
  });

  it("cấm có hạn: còn hạn thì cấm, quá hạn thì thôi", () => {
    expect(isBanned({ ...base, banned: true, banExpires: "2026-11-04T00:00:00Z" }, now)).toBe(true);
    expect(isBanned({ ...base, banned: true, banExpires: "2026-11-02T00:00:00Z" }, now)).toBe(
      false,
    );
  });
});

describe("toSessionUser", () => {
  it("giữ vai trò hợp lệ", () => {
    expect(toSessionUser({ ...base, role: "author" }, now).role).toBe("author");
  });

  it("vai trò lạ hoặc thiếu thì coi là user", () => {
    expect(toSessionUser({ ...base, role: "superadmin" }, now).role).toBe("user");
    expect(toSessionUser({ ...base, role: null }, now).role).toBe("user");
  });

  it("thiếu username thì null", () => {
    expect(toSessionUser({ id: "u1", name: "Lan", email: "lan@x.vn" }, now).username).toBeNull();
  });
});

describe("bannedMessage", () => {
  it("có lý do thì nói lý do", () => {
    expect(bannedMessage({ ...base, banReason: "spam" })).toBe(
      "Tài khoản của bạn đã bị khóa. Lý do: spam",
    );
  });

  it("không có lý do thì hướng dẫn liên hệ trưởng xóm", () => {
    expect(bannedMessage(base)).toMatch(/Liên hệ trưởng xóm/);
  });
});
