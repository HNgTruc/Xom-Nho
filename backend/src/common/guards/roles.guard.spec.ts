import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Role } from "@xom-nho/shared";
import type { SessionUser } from "../types/session-user.js";
import { RolesGuard } from "./roles.guard.js";

function setup(required: Role[] | undefined, role: Role | null) {
  const user: SessionUser | undefined = role
    ? { id: "u", name: "n", email: "e@x.vn", username: "n", role, banned: false }
    : undefined;
  const context = {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(required),
  } as unknown as Reflector;
  return { guard: new RolesGuard(reflector), context };
}

describe("RolesGuard", () => {
  it("route không có @Roles thì ai cũng qua", () => {
    const { guard, context } = setup(undefined, "user");

    expect(guard.canActivate(context)).toBe(true);
  });

  it("route admin: trưởng xóm qua", () => {
    const { guard, context } = setup(["admin"], "admin");

    expect(guard.canActivate(context)).toBe(true);
  });

  it.each<Role>(["user", "author"])("route admin: %s nhận 403", (role) => {
    const { guard, context } = setup(["admin"], role);

    expect(() => guard.canActivate(context)).toThrow(
      expect.objectContaining({ code: "FORBIDDEN" }),
    );
  });

  it("route admin: khách nhận 401", () => {
    const { guard, context } = setup(["admin"], null);

    expect(() => guard.canActivate(context)).toThrow(
      expect.objectContaining({ code: "UNAUTHORIZED" }),
    );
  });

  it("route cho nhiều vai trò: cây bút qua", () => {
    const { guard, context } = setup(["author", "admin"], "author");

    expect(guard.canActivate(context)).toBe(true);
  });
});
