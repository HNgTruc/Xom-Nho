import type { INestApplication } from "@nestjs/common";
import { API_PREFIX } from "@xom-nho/shared";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";

/** Cấu hình dùng chung cho main.ts và test e2e, để test chạy giống app thật. */
export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
}
