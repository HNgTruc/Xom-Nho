import { Module } from "@nestjs/common";
import { TagsController } from "./tags.controller.js";
import { TagsRepository } from "./tags.repository.js";
import { TagsService } from "./tags.service.js";

@Module({
  controllers: [TagsController],
  providers: [TagsService, TagsRepository],
  exports: [TagsService],
})
export class TagsModule {}
