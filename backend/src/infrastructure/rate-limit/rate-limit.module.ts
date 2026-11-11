import { Global, Module } from "@nestjs/common";
import { RateLimiter } from "./rate-limiter.js";

@Global()
@Module({
  providers: [{ provide: RateLimiter, useFactory: () => new RateLimiter() }],
  exports: [RateLimiter],
})
export class RateLimitModule {}
