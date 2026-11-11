import { RateLimiter } from "./rate-limiter.js";

describe("RateLimiter", () => {
  const rule = { limit: 2, windowMs: 1000, message: "Chậm lại chút nhé." };

  it("cho qua tới giới hạn, lần sau ném RATE_LIMITED", () => {
    const limiter = new RateLimiter(() => 0);
    limiter.consume("a", rule);
    limiter.consume("a", rule);

    expect(() => limiter.consume("a", rule)).toThrow(
      expect.objectContaining({ code: "RATE_LIMITED", message: "Chậm lại chút nhé." }),
    );
  });

  it("mỗi khóa đếm riêng", () => {
    const limiter = new RateLimiter(() => 0);
    limiter.consume("a", rule);
    limiter.consume("a", rule);

    expect(() => limiter.consume("b", rule)).not.toThrow();
  });

  it("hết cửa sổ thì được tiếp", () => {
    let now = 0;
    const limiter = new RateLimiter(() => now);
    limiter.consume("a", rule);
    limiter.consume("a", rule);

    now = 1000;
    expect(() => limiter.consume("a", rule)).not.toThrow();
  });
});
