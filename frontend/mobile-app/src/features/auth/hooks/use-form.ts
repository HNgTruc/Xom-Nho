import { useState } from "react";
import type { z } from "zod";

type Shape = Record<string, z.ZodType>;

/**
 * Form kiểm tra bằng schema Zod của `api`: một ô khi rời ô, cả form khi gửi.
 * Không dùng hook của `@xom-nho/ui` (ui resolve React của nó, app sẽ có hai bản React).
 */
export function useForm<S extends Shape>(
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

  function validateAll(): z.output<z.ZodObject<S>> | null {
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return result.data;
    }
    const next: Partial<Record<keyof S, string>> = {};
    for (const issue of result.error.issues) next[issue.path[0] as keyof S] ??= issue.message;
    setErrors(next);
    return null;
  }

  /** Props cho TextInput. */
  function field(name: keyof S & string) {
    return {
      value: values[name],
      onChangeText: (value: string) => setValues((prev) => ({ ...prev, [name]: value })),
      onBlur: () => validateField(name),
      "aria-invalid": errors[name] ? true : undefined,
    };
  }

  return { errors, field, validateAll };
}
