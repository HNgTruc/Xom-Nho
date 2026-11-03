/** Giới hạn dùng chung cho schema Zod (frontend + backend) và cột trong database. */
export const LIMITS = {
  PAGE_SIZE_DEFAULT: 10,
  PAGE_SIZE_MAX: 50,
  ADMIN_PAGE_SIZE_MAX: 100,

  PASSWORD_MIN: 8,

  POST_TITLE_MIN: 5,
  POST_TITLE_MAX: 200,
  SLUG_MAX: 220,
  POST_EXCERPT_MAX: 160,
  POST_TAGS_MAX: 5,

  CATEGORY_NAME_MAX: 50,
  TAG_NAME_MAX: 30,
} as const;
