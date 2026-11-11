import { z } from "zod";
import { LIMITS } from "../constants/limits.js";

const name = z
  .string()
  .trim()
  .min(LIMITS.USER_NAME_MIN, `Tên cần ít nhất ${LIMITS.USER_NAME_MIN} ký tự`)
  .max(LIMITS.USER_NAME_MAX, `Tên tối đa ${LIMITS.USER_NAME_MAX} ký tự`);

const email = z.string().trim().toLowerCase().pipe(z.email("Email chưa đúng định dạng"));

/** Form đăng ký (web, app). Gửi tới Better Auth `/api/auth/sign-up/email`. */
export const signUpSchema = z.object({
  name,
  email,
  password: z
    .string()
    .min(LIMITS.PASSWORD_MIN, `Mật khẩu cần ít nhất ${LIMITS.PASSWORD_MIN} ký tự`)
    .max(LIMITS.PASSWORD_MAX, `Mật khẩu tối đa ${LIMITS.PASSWORD_MAX} ký tự`),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

/** Form đăng nhập (web, admin, app). Không kiểm tra độ dài mật khẩu để không lộ quy tắc. */
export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Bạn chưa nhập mật khẩu"),
});

export type SignInInput = z.infer<typeof signInSchema>;

/** Chỉ nhận http(s), chặn `javascript:` và các scheme lạ khi hiển thị ảnh. */
const httpUrl = z
  .url({ protocol: /^https?$/, error: "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://" })
  .max(LIMITS.URL_MAX, `Đường dẫn tối đa ${LIMITS.URL_MAX} ký tự`);

/**
 * Các ô của hồ sơ, đủ cả: form cài đặt dùng (`profileFieldsSchema.pick(...)`), backend dùng qua `updateMeSchema`.
 * Một nguồn quy tắc cho cả hai phía.
 */
export const profileFieldsSchema = z.object({
  name,
  bio: z
    .string()
    .trim()
    .max(LIMITS.USER_BIO_MAX, `Giới thiệu tối đa ${LIMITS.USER_BIO_MAX} ký tự`)
    .transform((value) => value || null)
    .nullable(),
  image: z.union([z.literal("").transform(() => null), httpUrl]).nullable(),
});

/** `PATCH /api/v1/me`: sửa tên, giới thiệu, ảnh đại diện (ảnh qua URL ở giai đoạn đầu). */
export const updateMeSchema = profileFieldsSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Bạn chưa thay đổi gì");

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
