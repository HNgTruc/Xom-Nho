import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "../../config/config.service.js";
import { PrismaClient } from "../../generated/prisma/client.js";
import { createPrismaAdapter } from "./create-prisma-client.js";

/** Prisma client duy nhất của app. Chỉ `*.repository.ts` được inject service này. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({ adapter: createPrismaAdapter(config.get("DATABASE_URL")) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
