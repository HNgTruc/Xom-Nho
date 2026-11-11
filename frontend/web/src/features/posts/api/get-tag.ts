import type { Tag } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { cache } from "react";
import { serverApi } from "@/lib/server-api";

/**
 * Một thẻ theo slug, cho trang `/tag/<slug>`. Không có thì `null` (trang gọi `notFound()`); lỗi khác ném tiếp.
 * `cache` để `generateMetadata` và trang dùng chung một lần gọi trong cùng request.
 */
export const getTag = cache(async (slug: string): Promise<Tag | null> => {
  try {
    const { data } = await serverApi.tags.get(slug);
    return data;
  } catch (error) {
    if (isApiError(error) && error.status === 404) return null;
    throw error;
  }
});
