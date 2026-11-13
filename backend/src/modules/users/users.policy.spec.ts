import { ROLE_VALUES, type Role } from "@xom-nho/api";
import type { SessionUser } from "../../common/types/session-user.js";
import { UsersPolicy } from "./users.policy.js";

const admin: SessionUser = {
  id: "admin-1",
  name: "Trưởng Xóm",
  email: "truongxom@x.vn",
  username: "truongxom",
  role: "admin",
  banned: false,
};

const target = (role: Role, id = `id-${role}`) => ({ id, role });

describe("UsersPolicy.canChangeRole", () => {
  it.each(ROLE_VALUES)("đổi được vai trò của người khác đang là %s", (role) => {
    expect(UsersPolicy.canChangeRole(admin, target(role))).toBe(true);
  });

  it("không tự đổi vai trò của mình", () => {
    expect(UsersPolicy.canChangeRole(admin, target("admin", admin.id))).toBe(false);
  });
});

describe("UsersPolicy.canBan", () => {
  it.each(["user", "author"] as const)("cấm được %s", (role) => {
    expect(UsersPolicy.canBan(admin, target(role))).toBe(true);
  });

  it("không cấm được trưởng xóm khác", () => {
    expect(UsersPolicy.canBan(admin, target("admin", "admin-2"))).toBe(false);
  });

  it("không tự cấm mình", () => {
    expect(UsersPolicy.canBan(admin, target("admin", admin.id))).toBe(false);
  });
});
