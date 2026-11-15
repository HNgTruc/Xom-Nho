import { Module } from "@nestjs/common";
import { CategoriesAdminController } from "./categories.admin.controller.js";
import { CategoriesController } from "./categories.controller.js";
import { CategoriesRepository } from "./categories.repository.js";
import { CategoriesService } from "./categories.service.js";

@Module({
  controllers: [CategoriesController, CategoriesAdminController],
  providers: [CategoriesService, CategoriesRepository],
  exports: [CategoriesService],
})
export class CategoriesModule {}
