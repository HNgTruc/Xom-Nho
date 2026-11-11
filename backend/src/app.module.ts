import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./common/guards/auth.guard.js";
import { RolesGuard } from "./common/guards/roles.guard.js";
import { ConfigModule } from "./config/config.module.js";
import { AuthInfraModule } from "./infrastructure/auth/auth.module.js";
import { DatabaseModule } from "./infrastructure/database/database.module.js";
import { RateLimitModule } from "./infrastructure/rate-limit/rate-limit.module.js";
import { StorageModule } from "./infrastructure/storage/storage.module.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { FilesModule } from "./modules/files/files.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { PostsModule } from "./modules/posts/posts.module.js";
import { SearchModule } from "./modules/search/search.module.js";
import { TagsModule } from "./modules/tags/tags.module.js";
import { UsersModule } from "./modules/users/users.module.js";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthInfraModule,
    StorageModule,
    RateLimitModule,
    HealthModule,
    AuthModule,
    CategoriesModule,
    PostsModule,
    FilesModule,
    TagsModule,
    UsersModule,
    SearchModule,
  ],
  providers: [
    // Thứ tự quan trọng: AuthGuard gắn request.user trước, RolesGuard đọc sau
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
