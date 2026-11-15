import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import {
  type AdminCategory,
  type CategoryData,
  categoryInputSchema,
  type ReorderCategoriesInput,
  reorderCategoriesSchema,
  ROLES,
} from "@xom-nho/api";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe.js";
import { CategoriesService } from "./categories.service.js";

/** Danh mục trong trang quản trị (docs/api.md mục "Danh mục, tag", docs/tinh-nang.md mục 4.4). */
@Controller("admin/categories")
@Roles(ROLES.ADMIN)
export class CategoriesAdminController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(): Promise<AdminCategory[]> {
    return this.categoriesService.adminList();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(categoryInputSchema)) input: CategoryData,
  ): Promise<AdminCategory> {
    return this.categoriesService.create(input);
  }

  /** Khai báo trước `:id` để `order` không bị hiểu là id. */
  @Put("order")
  reorder(
    @Body(new ZodValidationPipe(reorderCategoriesSchema)) input: ReorderCategoriesInput,
  ): Promise<AdminCategory[]> {
    return this.categoriesService.reorder(input);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(categoryInputSchema)) input: CategoryData,
  ): Promise<AdminCategory> {
    return this.categoriesService.update(id, input);
  }

  /** Chỉ xóa được danh mục không còn bài. Trả 204. */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
