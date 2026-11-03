import { Global, Module } from "@nestjs/common";
import { ConfigService } from "./config.service.js";
import { loadEnv } from "./load-env.js";

@Global()
@Module({
  providers: [{ provide: ConfigService, useFactory: () => new ConfigService(loadEnv()) }],
  exports: [ConfigService],
})
export class ConfigModule {}
