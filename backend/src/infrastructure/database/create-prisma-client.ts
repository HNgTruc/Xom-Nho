import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";

/** Đổi `mysql://user:pass@host:port/db` thành cấu hình cho driver `mariadb` (driver không nhận scheme mysql://). */
export function toMariaDbConfig(databaseUrl: string) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    // MySQL 8 dùng caching_sha2_password; không TLS thì driver cần lấy khóa công khai từ server
    allowPublicKeyRetrieval: true,
  };
}

export function createPrismaAdapter(databaseUrl: string): PrismaMariaDb {
  return new PrismaMariaDb(toMariaDbConfig(databaseUrl));
}

/** Client ngoài Nest (seed, dọn dữ liệu trong test e2e). Trong app dùng `PrismaService`. */
export function createPrismaClient(databaseUrl: string): PrismaClient {
  return new PrismaClient({ adapter: createPrismaAdapter(databaseUrl) });
}
