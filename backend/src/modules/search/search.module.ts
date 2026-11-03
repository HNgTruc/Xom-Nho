import { Module } from "@nestjs/common";
import { PostsModule } from "../posts/posts.module.js";
import { SearchController } from "./search.controller.js";
import { SearchRepository } from "./search.repository.js";
import { SearchService } from "./search.service.js";

@Module({
  imports: [PostsModule],
  controllers: [SearchController],
  providers: [SearchService, SearchRepository],
})
export class SearchModule {}
