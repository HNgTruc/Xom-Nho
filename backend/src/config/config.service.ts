import type { Env } from "./env.schema.js";

/** Nơi duy nhất đọc biến môi trường trong `src/`. Giá trị đã qua schema Zod nên có kiểu đúng. */
export class ConfigService {
  constructor(private readonly env: Env) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.env[key];
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === "production";
  }
}
