import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ConfigService } from "./config/config.service.js";
import { setupApp } from "./setup-app.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  app.enableShutdownHooks();
  // 0.0.0.0 để điện thoại cùng Wi-Fi gọi được (Expo Go), xem docs/thiet-lap-moi-truong.md mục 5
  await app.listen(app.get(ConfigService).get("PORT"), "0.0.0.0");
}
await bootstrap();
