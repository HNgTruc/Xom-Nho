import { Controller, Get, Query } from "@nestjs/common";
import { type PostListItem, type SearchQuery, searchQuerySchema } from "@xom-nho/api";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import { SearchService } from "./search.service.js";

@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query(new ZodValidationPipe(searchQuerySchema)) query: SearchQuery,
  ): Promise<Paginated<PostListItem>> {
    return this.searchService.search(query);
  }
}
