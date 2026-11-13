import { Module } from "@nestjs/common";
import { UsersAdminController } from "./users.admin.controller.js";
import { UsersController } from "./users.controller.js";
import { UsersRepository } from "./users.repository.js";
import { UsersService } from "./users.service.js";

@Module({
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
