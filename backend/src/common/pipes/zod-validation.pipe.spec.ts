import { paginationQuerySchema } from "@xom-nho/shared";
import { z } from "zod";
import { AppException } from "../exceptions/app-exception.js";
import { ZodValidationPipe } from "./zod-validation.pipe.js";

describe("ZodValidationPipe", () => {
  it("trả dữ liệu đã parse (ép kiểu, điền mặc định)", () => {
    const pipe = new ZodValidationPipe(paginationQuerySchema);

    expect(pipe.transform({ page: "3" })).toEqual({ page: 3, pageSize: 10 });
  });

  it("ném VALIDATION_ERROR kèm lỗi từng trường", () => {
    const pipe = new ZodValidationPipe(
      z.object({
        title: z.string().min(5, "Tối thiểu 5 ký tự"),
        tags: z.array(z.string().min(1, "Tag trống")),
      }),
    );

    let error: unknown;
    try {
      pipe.transform({ title: "abc", tags: ["ok", ""] });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(AppException);
    expect(error).toMatchObject({
      code: "VALIDATION_ERROR",
      status: 400,
      message: "Tối thiểu 5 ký tự",
      fields: { title: "Tối thiểu 5 ký tự", "tags.1": "Tag trống" },
    });
  });
});
