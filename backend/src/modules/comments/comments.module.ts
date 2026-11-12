import { Module } from "@nestjs/common";
import { PostsModule } from "../posts/posts.module.js";
import { CommentsController } from "./comments.controller.js";
import { CommentsRepository } from "./comments.repository.js";
import { CommentsService } from "./comments.service.js";

@Module({
  imports: [PostsModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService],
})
export class CommentsModule {}
