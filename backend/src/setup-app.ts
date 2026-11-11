import type { NestExpressApplication } from "@nestjs/platform-express";
import { API_PREFIX, AUTH_PREFIX } from "@xom-nho/api";
import { toNodeHandler } from "better-auth/node";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";
import { ConfigService } from "./config/config.service.js";
import { AUTH } from "./infrastructure/auth/auth.module.js";
import type { Auth } from "./infrastructure/auth/create-auth.js";

/**
 * Cấu hình dùng chung cho main.ts và test e2e, để test chạy giống app thật.
 * App phải tạo với `bodyParser: false`: Better Auth tự đọc body, nên handler của nó gắn trước JSON parser.
 * Thứ tự: CORS → /api/auth/* (Better Auth) → JSON parser → route của Nest.
 */
export function setupApp(app: NestExpressApplication): void {
  // Chỉ đúng các frontend trong CORS_ORIGINS, có cookie. Không bao giờ dùng origin "*".
  app.enableCors({ origin: app.get(ConfigService).get("CORS_ORIGINS"), credentials: true });
  app.disable("x-powered-by");

  app
    .getHttpAdapter()
    .getInstance()
    .all(`${AUTH_PREFIX}/{*path}`, toNodeHandler(app.get<Auth>(AUTH)));
  app.useBodyParser("json", { limit: "1mb" });

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
}
