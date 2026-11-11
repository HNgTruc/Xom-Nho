import { describe, expect, it } from "vitest";
import { AUTH_FALLBACK_MESSAGE, authErrorMessage } from "./auth-messages.js";

describe("authErrorMessage", () => {
  it("dịch mã lỗi của Better Auth sang tiếng Việt", () => {
    expect(authErrorMessage({ code: "INVALID_EMAIL_OR_PASSWORD" })).toBe(
      "Email hoặc mật khẩu chưa đúng. Thử lại nhé.",
    );
  });

  it("bị giới hạn tần suất (429) thì nhắc chờ", () => {
    expect(authErrorMessage({ status: 429 })).toMatch(/Chờ một phút/);
  });

  it("bị cấm thì dùng câu có lý do do backend gửi", () => {
    const message = "Tài khoản của bạn đã bị khóa. Lý do: spam";

    expect(authErrorMessage({ code: "BANNED_USER", message })).toBe(message);
  });

  it("mã lạ hoặc không có lỗi thì dùng câu chung", () => {
    expect(authErrorMessage({ code: "SOMETHING_NEW" })).toBe(AUTH_FALLBACK_MESSAGE);
    expect(authErrorMessage(null)).toBe(AUTH_FALLBACK_MESSAGE);
  });
});
