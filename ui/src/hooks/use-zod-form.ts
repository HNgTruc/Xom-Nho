"use client";

import { useState } from "react";
import type { z } from "zod";

type Shape = Record<string, z.ZodType>;

/**
 * Form nhỏ kiểm tra bằng schema Zod của `shared` (cùng schema backend dùng):
 * kiểm tra một ô khi rời ô, cả form khi gửi (MASTER mục 7 "Form").
 */
export function useZodForm<S extends Shape>(
  schema: z.ZodObject<S>,
  initial: { [K in keyof S]: string },
) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof S, string>>>({});

  function validateField(name: keyof S): void {
    const result = schema.shape[name]!.safeParse(values[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: result.success ? undefined : result.error.issues[0]?.message,
    }));
  }

  /** Trả dữ liệu đã parse, hoặc null và hiện lỗi từng ô. */
  function validateAll(): z.output<z.ZodObject<S>> | null {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: Partial<Record<keyof S, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof S;
      next[key] ??= issue.message;
    }
    setErrors(next);
    return null;
  }

  /** Props gắn vào ô nhập: giá trị, đổi giá trị, kiểm tra khi rời ô, trạng thái lỗi cho trình đọc màn hình. */
  function field(name: keyof S & string) {
    const error = errors[name];
    return {
      id: name,
      name,
      value: values[name],
      onChange: (event: { target: { value: string } }) => {
        const value = event.target.value;
        setValues((prev) => ({ ...prev, [name]: value }));
      },
      onBlur: () => validateField(name),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${name}-error` : undefined,
    };
  }

  return { values, errors, field, validateAll };
}
