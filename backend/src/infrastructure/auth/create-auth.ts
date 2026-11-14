import { expo } from "@better-auth/expo";
import { ROLES } from "@xom-nho/api";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import type { Env } from "../../config/env.schema.js";
import type { PrismaClient } from "../../generated/prisma/client.js";
import { accessControl, roles } from "./roles.js";
import { bannedMessage } from "./session-user.js";
import { generateUsername, toUsernameBase } from "./username.js";

type AuthEnv = Pick<
  Env,
  | "NODE_ENV"
  | "BETTER_AUTH_SECRET"
  | "BETTER_AUTH_URL"
  | "CORS_ORIGINS"
  | "MOBILE_APP_SCHEME"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "GITHUB_CLIENT_ID"
  | "GITHUB_CLIENT_SECRET"
>;

type OAuthEnv = Pick<
  Env,
  "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "GITHUB_CLIENT_ID" | "GITHUB_CLIENT_SECRET"
>;

/** Nhà cung cấp OAuth nào đủ khóa thì mới bật; frontend hỏi `GET /api/v1/auth/providers` để ẩn/hiện nút. */
export function enabledSocialProviders(env: OAuthEnv) {
  return {
    ...(env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET && {
        google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
      }),
    ...(env.GITHUB_CLIENT_ID &&
      env.GITHUB_CLIENT_SECRET && {
        github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
      }),
  };
}

/** Origin được phép gọi /api/auth (chống CSRF): web, admin, app Expo. */
export function trustedOriginsFor(env: AuthEnv): string[] {
  return [
    ...env.CORS_ORIGINS,
    `${env.MOBILE_APP_SCHEME}://`,
    // Expo Go khi dev mở app bằng exp://<ip>:<port>; chỉ tin khi không phải production
    ...(env.NODE_ENV === "production" ? [] : ["exp://**"]),
  ];
}

/**
 * Route HTTP của plugin admin (better-auth 1.7, `dist/plugins/admin/routes.mjs`), tắt hết: trả 404. Quản trị đi
 * qua `/api/v1/admin/*` (có policy: không tự hạ vai trò, không cấm trưởng xóm khác, bắt buộc lý do, docs/api.md).
 * Các route này bỏ qua những quy tắc đó, và có cả xóa thành viên, đặt lại mật khẩu, đóng vai người khác. Plugin
 * vẫn bật cho cột `role`, `banned` và hook chặn người bị cấm đăng nhập. Nâng bản Better Auth thì so lại danh sách.
 */
export const DISABLED_ADMIN_PATHS = [
  "/admin/ban-user",
  "/admin/create-user",
  "/admin/get-user",
  "/admin/has-permission",
  "/admin/impersonate-user",
  "/admin/list-user-sessions",
  "/admin/list-users",
  "/admin/remove-user",
  "/admin/revoke-user-session",
  "/admin/revoke-user-sessions",
  "/admin/set-role",
  "/admin/set-user-password",
  "/admin/stop-impersonating",
  "/admin/unban-user",
  "/admin/update-user",
];

/**
 * Better Auth của Xóm Nhỏ, gắn ở /api/auth/* (main.ts qua setupApp).
 * Email + mật khẩu, Google/GitHub (nếu có khóa), plugin admin (vai trò, cấm), plugin Expo (app).
 */
export function createAuth(prisma: PrismaClient, env: AuthEnv) {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    trustedOrigins: trustedOriginsFor(env),
    database: prismaAdapter(prisma, { provider: "mysql" }),
    telemetry: { enabled: false },
    disabledPaths: DISABLED_ADMIN_PATHS,
    advanced: {
      // Better Auth tự tắt kiểm tra origin (chống CSRF) khi NODE_ENV=test; bật rõ để test chạy như production
      disableOriginCheck: false,
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // Chưa có dịch vụ gửi mail: không bắt xác minh email
      requireEmailVerification: false,
      autoSignIn: true,
    },
    socialProviders: enabledSocialProviders(env),
    account: {
      // Cùng email thì gộp Google/GitHub vào tài khoản có sẵn (tinh-nang.md 1.2)
      accountLinking: { enabled: true, trustedProviders: ["google", "github"] },
    },

    user: {
      additionalFields: {
        // input: false: người dùng không tự đặt qua API đăng ký của Better Auth
        username: { type: "string", required: false, input: false },
        bio: { type: "string", required: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const username = await generateUsername(
              toUsernameBase(user.name, user.email),
              async (candidate) =>
                (await prisma.user.count({ where: { username: candidate } })) > 0,
            );
            return { data: { ...user, username } };
          },
        },
      },
    },

    // Chặn đoán mật khẩu: mặc định Better Auth chỉ bật ở production, ở đây bật luôn (trừ khi chạy test)
    rateLimit: {
      enabled: env.NODE_ENV !== "test",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },

    plugins: [
      admin({
        ac: accessControl,
        roles,
        defaultRole: ROLES.USER,
        adminRoles: [ROLES.ADMIN],
        bannedUserMessage: (user) => bannedMessage(user),
      }),
      expo(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
