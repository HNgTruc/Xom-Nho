import { Controller, Get } from "@nestjs/common";
import type { Category } from "@xom-nho/api";
import { CategoriesService } from "./categories.service.js";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(): Promise<Category[]> {
    return this.categoriesService.list();
  }
}
