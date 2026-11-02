import type { INestApplication } from "@nestjs/common";
import { API_PREFIX } from "@xom-nho/shared";

/** Cấu hình dùng chung cho main.ts và test e2e, để test chạy giống app thật. */
export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
}
