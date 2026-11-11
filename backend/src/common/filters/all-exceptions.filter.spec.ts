import { Logger, NotFoundException, PayloadTooLargeException } from "@nestjs/common";
import { ERROR_MESSAGES } from "@xom-nho/api";
import { AppException } from "../exceptions/app-exception.js";
import { AllExceptionsFilter } from "./all-exceptions.filter.js";

describe("AllExceptionsFilter", () => {
  const filter = new AllExceptionsFilter();

  it("giữ mã, câu và lỗi từng trường của AppException", () => {
    const result = filter.toErrorBody(
      new AppException("VALIDATION_ERROR", "Tiêu đề quá ngắn", { title: "Tối thiểu 5 ký tự" }),
    );

    expect(result).toEqual({
      status: 400,
      body: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Tiêu đề quá ngắn",
          fields: { title: "Tối thiểu 5 ký tự" },
        },
      },
    });
  });

  it("AppException không truyền câu thì dùng câu mặc định của mã lỗi", () => {
    const result = filter.toErrorBody(new AppException("NOT_FOUND"));

    expect(result.body.error.message).toBe(ERROR_MESSAGES.NOT_FOUND);
  });

  it("đổi lỗi 404 của Nest sang NOT_FOUND với câu tiếng Việt", () => {
    const result = filter.toErrorBody(new NotFoundException("Cannot GET /x"));

    expect(result).toEqual({
      status: 404,
      body: { error: { code: "NOT_FOUND", message: ERROR_MESSAGES.NOT_FOUND } },
    });
  });

  it("lỗi 4xx khác của Nest giữ status, mã VALIDATION_ERROR", () => {
    const result = filter.toErrorBody(new PayloadTooLargeException());

    expect(result.status).toBe(413);
    expect(result.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("lỗi không lường trước trả 500 câu chung, không lộ chi tiết", () => {
    const logSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

    const result = filter.toErrorBody(
      new Error("PrismaClientKnownRequestError: bảng user không tồn tại"),
    );

    expect(result).toEqual({
      status: 500,
      body: { error: { code: "INTERNAL_ERROR", message: ERROR_MESSAGES.INTERNAL_ERROR } },
    });
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
