import { type PipeTransform } from "@nestjs/common";
import type { z } from "zod";
import { AppException } from "../exceptions/app-exception.js";

/**
 * Kiểm tra body/query/param bằng schema Zod từ `@xom-nho/api`, trả dữ liệu đã parse.
 * Sai thì ném `VALIDATION_ERROR` kèm lỗi từng trường để form hiện cạnh ô nhập.
 *
 *   @Body(new ZodValidationPipe(createPostSchema)) input: CreatePostInput
 */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform<unknown, z.output<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "_";
      fields[key] ??= issue.message;
    }
    throw new AppException("VALIDATION_ERROR", result.error.issues[0]?.message, fields);
  }
}
