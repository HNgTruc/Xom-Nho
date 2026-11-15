import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import {
  type AdminListTagsQuery,
  adminListTagsQuerySchema,
  type AdminTag,
  type MergeTagInput,
  mergeTagSchema,
  ROLES,
} from "@xom-nho/api";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import type { Paginated } from "../../common/types/paginated.js";
import { TagsService } from "./tags.service.js";

/** Thẻ trong trang quản trị (docs/api.md mục "Danh mục, tag", docs/tinh-nang.md mục 4.4): gộp, xóa. */
@Controller("admin/tags")
@Roles(ROLES.ADMIN)
export class TagsAdminController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(adminListTagsQuerySchema)) query: AdminListTagsQuery,
  ): Promise<Paginated<AdminTag>> {
    return this.tagsService.adminList(query);
  }

  @Post(":id/merge")
  @HttpCode(HttpStatus.OK)
  merge(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(mergeTagSchema)) input: MergeTagInput,
  ): Promise<AdminTag> {
    return this.tagsService.merge(id, input);
  }

  /** Xóa thẻ, gỡ khỏi mọi bài. Trả 204. */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string): Promise<void> {
    return this.tagsService.adminRemove(id);
  }
}
