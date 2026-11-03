import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AuthUserRecord } from "../../infrastructure/auth/session-user.js";
import type { RequestWithUser } from "../decorators/current-user.decorator.js";
import { AppException } from "../exceptions/app-exception.js";
import { AuthGuard } from "./auth.guard.js";

function setup(sessionUser: AuthUserRecord | null, isPublic: boolean) {
  const request = { headers: { cookie: "phien=abc" } } as unknown as RequestWithUser;
  const context = {
    getType: () => "http",
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  const getSession = vi
    .fn()
    .mockResolvedValue(sessionUser ? { user: sessionUser, session: {} } : null);
  const reflector = {
    getAllAndOverride: vi.fn().mockReturnValue(isPublic),
  } as unknown as Reflector;
  const guard = new AuthGuard({ api: { getSession } } as never, reflector);
  return { guard, context, request, getSession };
}

const user = (role: string, extra: Partial<AuthUserRecord> = {}): AuthUserRecord => ({
  id: `id-${role}`,
  name: role,
  email: `${role}@x.vn`,
  username: role,
  role,
  banned: false,
  ...extra,
});

async function errorOf(promise: Promise<unknown>) {
  return promise.then(
    () => undefined,
    (error: unknown) => error,
  );
}

describe("AuthGuard", () => {
  it("khách gọi route cần đăng nhập thì 401", async () => {
    const { guard, context } = setup(null, false);

    const error = await errorOf(guard.canActivate(context));

    expect(error).toBeInstanceOf(AppException);
    expect(error).toMatchObject({ code: "UNAUTHORIZED", status: 401 });
  });

  it("khách gọi route công khai thì cho qua, không có user", async () => {
    const { guard, context, request } = setup(null, true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it.each(["user", "author", "admin"])(
    "%s đăng nhập thì gắn request.user đúng vai trò",
    async (role) => {
      const { guard, context, request } = setup(user(role), false);

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(request.user).toMatchObject({ id: `id-${role}`, role, banned: false });
    },
  );

  it("đọc phiên từ header của request (cookie)", async () => {
    const { guard, context, getSession } = setup(user("user"), false);

    await guard.canActivate(context);

    const headers = getSession.mock.calls[0]?.[0]?.headers as Headers;
    expect(headers.get("cookie")).toBe("phien=abc");
  });

  it("người bị cấm gọi route cần đăng nhập thì 403 kèm lý do", async () => {
    const { guard, context } = setup(user("user", { banned: true, banReason: "spam" }), false);

    const error = await errorOf(guard.canActivate(context));

    expect(error).toMatchObject({
      code: "FORBIDDEN",
      message: "Tài khoản của bạn đã bị khóa. Lý do: spam",
    });
  });

  it("người bị cấm vào route công khai thì như khách", async () => {
    const { guard, context, request } = setup(user("user", { banned: true }), true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it("lệnh cấm đã hết hạn thì dùng bình thường", async () => {
    const { guard, context, request } = setup(
      user("user", { banned: true, banExpires: new Date(Date.now() - 1000) }),
      false,
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user?.banned).toBe(false);
  });
});
