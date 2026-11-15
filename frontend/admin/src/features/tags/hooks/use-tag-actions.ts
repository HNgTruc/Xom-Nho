import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminTag } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { toast } from "@xom-nho/ui/components/toaster";
import { adminPostsKeys } from "@/features/posts";
import { api } from "@/lib/api";
import { adminTagsKeys } from "../api/tags.queries";

const errorText = (error: unknown, fallback: string) =>
  isApiError(error) ? error.message : fallback;

/**
 * Gộp, xóa thẻ (docs/tinh-nang.md mục 4.4). Cả hai không hoàn tác được nên đi qua hộp xác nhận ở bảng; xong thì
 * làm mới bảng thẻ và bảng bài (tìm bài theo tên thẻ đổi theo).
 */
export function useTagActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminTagsKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminPostsKeys.all }),
    ]);

  const merge = useMutation({
    mutationFn: ({ source, target }: { source: AdminTag; target: AdminTag }) =>
      api.admin.tags.merge(source.id, { targetId: target.id }),
    onSuccess: ({ data }, { source }) =>
      toast(`Đã gộp “${source.name}” vào “${data.name}”`, {
        description: `Thẻ “${data.name}” giờ có ${data.postCount} bài.`,
      }),
    onError: (error) => toast.error(errorText(error, "Chưa gộp được thẻ. Bạn thử lại nhé.")),
    onSettled: refresh,
  });

  const remove = useMutation({
    mutationFn: (tag: AdminTag) => api.admin.tags.remove(tag.id),
    onSuccess: (_, tag) => toast(`Đã xóa thẻ “${tag.name}”`),
    onError: (error) => toast.error(errorText(error, "Chưa xóa được thẻ. Bạn thử lại nhé.")),
    onSettled: refresh,
  });

  return { merge, remove };
}
