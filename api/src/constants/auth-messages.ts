/**
 * Mã lỗi Better Auth trả về (`error.code`) → câu tiếng Việt cho web, admin, app.
 * Mã nào không có ở đây thì dùng `AUTH_FALLBACK_MESSAGE`.
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email hoặc mật khẩu chưa đúng. Thử lại nhé.",
  INVALID_PASSWORD: "Mật khẩu chưa đúng. Thử lại nhé.",
  INVALID_EMAIL: "Email chưa đúng định dạng.",
  USER_ALREADY_EXISTS: "Email này đã có người dùng. Bạn thử đăng nhập xem sao.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email này đã có người dùng. Bạn thử đăng nhập xem sao.",
  PASSWORD_TOO_SHORT: "Mật khẩu cần ít nhất 8 ký tự.",
  PASSWORD_TOO_LONG: "Mật khẩu dài quá rồi.",
  BANNED_USER: "Tài khoản của bạn đã bị khóa.",
  SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn. Bạn đăng nhập lại nhé.",
  PROVIDER_NOT_FOUND: "Cách đăng nhập này chưa được bật.",
  TOO_MANY_REQUESTS: "Bạn thử nhiều lần quá. Chờ một phút rồi thử lại nhé.",
};

export const AUTH_FALLBACK_MESSAGE = "Chưa đăng nhập được. Bạn thử lại sau ít phút nhé.";

/**
 * Câu báo lỗi cho người dùng từ lỗi của Better Auth client.
 * Bị cấm: Better Auth đã gửi kèm câu có lý do (cấu hình `bannedUserMessage` ở backend) nên dùng luôn câu đó.
 */
export function authErrorMessage(
  error: { code?: string; message?: string; status?: number } | null | undefined,
): string {
  if (!error) return AUTH_FALLBACK_MESSAGE;
  if (error.status === 429) return AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS!;
  if (error.code === "BANNED_USER" && error.message?.startsWith("Tài khoản")) return error.message;
  return (error.code && AUTH_ERROR_MESSAGES[error.code]) || AUTH_FALLBACK_MESSAGE;
}
