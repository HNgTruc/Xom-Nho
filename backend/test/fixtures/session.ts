import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import type { PrismaClient } from "../../src/generated/prisma/client.js";

export const WEB_ORIGIN = "http://localhost:3000";

/**
 * Đăng ký qua Better Auth (như người dùng thật), đặt vai trò trong database, trả cookie phiên và id.
 * Dùng cho mọi route đọc dữ liệu: khách không gọi được gì ngoài đăng ký, đăng nhập (ADR 0007).
 */
export async function signUp(
  app: INestApplication,
  prisma: PrismaClient,
  email: string,
  role = "user",
): Promise<{ cookie: string; id: string }> {
  const res = await request(app.getHttpServer())
    .post("/api/auth/sign-up/email")
    .set("Origin", WEB_ORIGIN)
    .send({ name: email.split("@")[0], email, password: "matkhau123" })
    .expect(200);
  const user = await prisma.user.update({ where: { email }, data: { role } });
  const setCookie = res.headers["set-cookie"] as unknown as string[];
  return { cookie: setCookie.map((c) => c.split(";")[0]).join("; "), id: user.id };
}
