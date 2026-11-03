import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./common/guards/auth.guard.js";
import { RolesGuard } from "./common/guards/roles.guard.js";
import { ConfigModule } from "./config/config.module.js";
import { AuthInfraModule } from "./infrastructure/auth/auth.module.js";
import { DatabaseModule } from "./infrastructure/database/database.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { HealthModule } from "./modules/health/health.module.js";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthInfraModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
  ],
  providers: [
    // Thứ tự quan trọng: AuthGuard gắn request.user trước, RolesGuard đọc sau
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
