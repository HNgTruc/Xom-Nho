import type { INestApplication } from "@nestjs/common";
import { API_PREFIX } from "@xom-nho/shared";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";
import { ConfigService } from "./config/config.service.js";

/** Cấu hình dùng chung cho main.ts và test e2e, để test chạy giống app thật. */
export function setupApp(app: INestApplication): void {
  // Chỉ đúng các frontend trong CORS_ORIGINS, có cookie. Không bao giờ dùng origin "*".
  app.enableCors({ origin: app.get(ConfigService).get("CORS_ORIGINS"), credentials: true });
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
}
