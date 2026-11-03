import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller.js";
import { PostsRepository } from "./posts.repository.js";
import { PostsService } from "./posts.service.js";

@Module({
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
  exports: [PostsService],
})
export class PostsModule {}
