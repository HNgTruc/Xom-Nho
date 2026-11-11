import { z } from "zod";
import { LIMITS } from "../constants/limits.js";

/** Query `?page=&pageSize=` của các route danh sách. Chuỗi từ URL được ép sang số. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Số trang bắt đầu từ 1").default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1, "Mỗi trang cần ít nhất 1 mục")
    .max(LIMITS.PAGE_SIZE_MAX, `Mỗi trang tối đa ${LIMITS.PAGE_SIZE_MAX} mục`)
    .default(LIMITS.PAGE_SIZE_DEFAULT),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
