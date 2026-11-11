import { Injectable } from "@nestjs/common";
import { AppException } from "../../common/exceptions/app-exception.js";

export interface RateLimitRule {
  /** Số lần tối đa trong một cửa sổ */
  limit: number;
  /** Độ dài cửa sổ, mili giây */
  windowMs: number;
  /** Câu báo khi vượt, tiếng Việt */
  message: string;
}

/**
 * Giới hạn tần suất trong bộ nhớ, cửa sổ trượt theo khóa (ví dụ `upload:<userId>`). Đủ cho một bản backend;
 * chạy nhiều bản cùng lúc thì phải chuyển sang kho dùng chung (Redis), ghi ở lo-trinh giai đoạn Hoàn thiện.
 */
@Injectable()
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(private readonly now: () => number = Date.now) {}

  /** Ghi một lần; vượt giới hạn thì ném RATE_LIMITED (429) và không ghi. */
  consume(key: string, rule: RateLimitRule): void {
    const now = this.now();
    const recent = (this.hits.get(key) ?? []).filter((time) => now - time < rule.windowMs);
    if (recent.length >= rule.limit) {
      this.hits.set(key, recent);
      throw new AppException("RATE_LIMITED", rule.message);
    }
    recent.push(now);
    this.hits.set(key, recent);
  }
}
