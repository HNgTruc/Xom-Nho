import { Controller, Get, Param } from "@nestjs/common";
import type { PublicProfile } from "@xom-nho/api";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import type { SessionUser } from "../../common/types/session-user.js";
import { UsersService } from "./users.service.js";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":username")
  get(
    @CurrentUser() user: SessionUser,
    @Param("username") username: string,
  ): Promise<PublicProfile> {
    return this.usersService.getProfile(user, username);
  }
}
