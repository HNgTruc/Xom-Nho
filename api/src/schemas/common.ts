import { z } from "zod";
import { LIMITS } from "../constants/limits.js";

/** Dạng slug do `slugify` tạo: chữ thường a-z, số, các cụm nối bằng một dấu gạch ngang. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Dạng username do `generateUsername` ở backend tạo: chỉ a-z, 0-9. */
const USERNAME_PATTERN = /^[a-z0-9]+$/;

/** Id trong đường dẫn: `cuid()` (25 ký tự) hoặc id Better Auth (32 ký tự). Chừa rộng cho kiểu id sau này. */
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const ID_MAX = 64;

/**
 * Slug của danh mục, tag trong bộ lọc (`?category=`, `?tag=`). Dễ dãi: cắt khoảng trắng, đổi chữ thường.
 * Slug trên đường dẫn trang dùng `pathSlugSchema` (khớp chính xác).
 */
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(LIMITS.SLUG_MAX, `Đường dẫn tối đa ${LIMITS.SLUG_MAX} ký tự`)
  .regex(SLUG_PATTERN, "Đường dẫn không hợp lệ");

/**
 * Username trong bộ lọc `?author=`. Dễ dãi như `slugSchema`.
 * Ràng buộc (a-z0-9, tối đa 20) hẹp hơn cột `user.username` (50): nới ra thì được, siết lại là thay đổi phá vỡ API v1.
 */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(LIMITS.USERNAME_MAX, `Tên người dùng tối đa ${LIMITS.USERNAME_MAX} ký tự`)
  .regex(USERNAME_PATTERN, "Tên người dùng không hợp lệ");

/**
 * Slug trên đường dẫn (`/posts/:slug`, `/tags/:slug`): phải đúng dạng chuẩn, không tự đổi chữ hoa hay cắt
 * khoảng trắng, để mỗi trang chỉ có một URL. Backend coi slug không khớp là không có (404).
 */
export const pathSlugSchema = z.string().max(LIMITS.SLUG_MAX).regex(SLUG_PATTERN);

/** Username trên đường dẫn (`/users/:username`): khớp chính xác như `pathSlugSchema`. */
export const pathUsernameSchema = z.string().max(LIMITS.USERNAME_MAX).regex(USERNAME_PATTERN);

/** Id trên đường dẫn (`/posts/:id/view`). Backend coi id sai dạng là không có (404), không truy vấn database. */
export const pathIdSchema = z.string().max(ID_MAX).regex(ID_PATTERN);

/** Ô lọc rỗng từ URL (`?category=`) coi như không lọc. */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

/** Bộ lọc tùy chọn theo slug: `?category=doi-song`, `?tag=an-vat`. */
export const optionalSlugFilter = z.preprocess(emptyToUndefined, slugSchema.optional());

/** Bộ lọc tùy chọn theo username: `?author=lananh`. */
export const optionalUsernameFilter = z.preprocess(emptyToUndefined, usernameSchema.optional());
