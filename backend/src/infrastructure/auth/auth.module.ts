import { Global, Module } from "@nestjs/common";
import { ConfigService } from "../../config/config.service.js";
import { PrismaService } from "../database/prisma.service.js";
import { createAuth } from "./create-auth.js";

/** Token inject instance Better Auth (kiểu `Auth` trong create-auth.ts). */
export const AUTH = Symbol("BETTER_AUTH");

@Global()
@Module({
  providers: [
    {
      provide: AUTH,
      inject: [PrismaService, ConfigService],
      useFactory: (prisma: PrismaService, config: ConfigService) =>
        createAuth(prisma, {
          NODE_ENV: config.get("NODE_ENV"),
          BETTER_AUTH_SECRET: config.get("BETTER_AUTH_SECRET"),
          BETTER_AUTH_URL: config.get("BETTER_AUTH_URL"),
          CORS_ORIGINS: config.get("CORS_ORIGINS"),
          MOBILE_APP_SCHEME: config.get("MOBILE_APP_SCHEME"),
          GOOGLE_CLIENT_ID: config.get("GOOGLE_CLIENT_ID"),
          GOOGLE_CLIENT_SECRET: config.get("GOOGLE_CLIENT_SECRET"),
          GITHUB_CLIENT_ID: config.get("GITHUB_CLIENT_ID"),
          GITHUB_CLIENT_SECRET: config.get("GITHUB_CLIENT_SECRET"),
        }),
    },
  ],
  exports: [AUTH],
})
export class AuthInfraModule {}
