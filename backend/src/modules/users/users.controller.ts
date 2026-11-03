import { Controller, Get, Param } from "@nestjs/common";
import type { PublicProfile } from "@xom-nho/shared";
import { Public } from "../../common/decorators/public.decorator.js";
import { UsersService } from "./users.service.js";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(":username")
  get(@Param("username") username: string): Promise<PublicProfile> {
    return this.usersService.getProfile(username);
  }
}
