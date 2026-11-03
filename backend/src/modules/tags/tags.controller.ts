import { Controller, Get, Param, Query } from "@nestjs/common";
import { type Tag, type TagSuggestQuery, tagSuggestQuerySchema } from "@xom-nho/shared";
import { Public } from "../../common/decorators/public.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { TagsService } from "./tags.service.js";

@Controller("tags")
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Public()
  @Get()
  suggest(
    @Query(new ZodValidationPipe(tagSuggestQuerySchema)) query: TagSuggestQuery,
  ): Promise<Tag[]> {
    return this.tagsService.suggest(query);
  }

  @Public()
  @Get(":slug")
  get(@Param("slug") slug: string): Promise<Tag> {
    return this.tagsService.getBySlug(slug);
  }
}
