import { Controller, Get } from "@nestjs/common";
import type { Category } from "@xom-nho/api";
import { Public } from "../../common/decorators/public.decorator.js";
import { CategoriesService } from "./categories.service.js";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  list(): Promise<Category[]> {
    return this.categoriesService.list();
  }
}
