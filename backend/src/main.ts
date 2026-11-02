import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { setupApp } from "./setup-app.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  // TODO(giai đoạn 1): đọc PORT qua ConfigService có schema Zod
  const port = Number(process.env.PORT ?? 4000);
  // 0.0.0.0 để điện thoại cùng Wi-Fi gọi được (Expo Go), xem docs/thiet-lap-moi-truong.md mục 5
  await app.listen(port, "0.0.0.0");
}
await bootstrap();
