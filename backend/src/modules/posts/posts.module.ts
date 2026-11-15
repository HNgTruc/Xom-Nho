import { Module } from "@nestjs/common";
import { PostsAdminController } from "./posts.admin.controller.js";
import { PostsController } from "./posts.controller.js";
import { PostsMeController } from "./posts.me.controller.js";
import { PostsRepository } from "./posts.repository.js";
import { PostsService } from "./posts.service.js";

@Module({
  controllers: [PostsController, PostsMeController, PostsAdminController],
  providers: [PostsService, PostsRepository],
  exports: [PostsService],
})
export class PostsModule {}
