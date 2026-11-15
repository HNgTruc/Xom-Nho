import { Module } from "@nestjs/common";
import { BlocksController } from "./blocks.controller.js";
import { FriendsController } from "./friends.controller.js";
import { FriendsRepository } from "./friends.repository.js";
import { FriendsService } from "./friends.service.js";

@Module({
  controllers: [FriendsController, BlocksController],
  providers: [FriendsService, FriendsRepository],
  // Hồ sơ (`UsersService`) cần số bạn bè và quan hệ với người xem
  exports: [FriendsService],
})
export class FriendsModule {}
