import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module.js";
import { DatabaseModule } from "./infrastructure/database/database.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { HealthModule } from "./modules/health/health.module.js";

@Module({
  imports: [ConfigModule, DatabaseModule, HealthModule, CategoriesModule],
})
export class AppModule {}
