import { Controller, Get, Param } from "@nestjs/common";
import type { PublicProfile } from "@xom-nho/api";
import { UsersService } from "./users.service.js";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":username")
  get(@Param("username") username: string): Promise<PublicProfile> {
    return this.usersService.getProfile(username);
  }
}
