import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isApiError } from "@xom-nho/api/api-client";
import { toast } from "@xom-nho/ui/components/toaster";
import { api } from "@/lib/api";
import { adminPostsKeys } from "../api/posts.queries";

/** Câu lỗi tiếng Việt của backend nếu có (409 "Chỉ ẩn được bài đang hiện..."), không thì câu chung. */
function errorText(error: unknown, fallback: string): string {
  return isApiError(error) ? error.message : fallback;
}

/**
 * Gửi một thao tác cho nhiều bài (chọn nhiều), từng bài một. Trả số bài thành công; bài lỗi (đã bị người khác
 * ẩn, xóa) không chặn bài khác.
 */
async function forEach(ids: string[], action: (id: string) => Promise<unknown>) {
  const results = await Promise.allSettled(ids.map((id) => action(id)));
  const failed = results.find((result) => result.status === "rejected");
  return {
    done: ids.filter((_, index) => results[index]?.status === "fulfilled"),
    error: failed?.status === "rejected" ? failed.reason : null,
  };
}

const count = (ids: string[]) => (ids.length === 1 ? "bài" : `${ids.length} bài`);

/**
 * Ẩn, hiện lại, xóa bài (pages/admin.md "Ẩn bài", "Hộp thoại xác nhận"): xong thì làm mới bảng, số liệu, và báo
 * bằng toast; ẩn, hiện lại có "Hoàn tác". Xóa không hoàn tác được nên đã hỏi lại trước đó (ConfirmDialog).
 */
export function usePostActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminPostsKeys.all });

  const restore = useMutation({
    mutationFn: (ids: string[]) => forEach(ids, (id) => api.admin.posts.restore(id)),
    onSuccess: ({ done, error }) => {
      if (done.length > 0) toast(`Đã hiện lại ${count(done)}`);
      if (error) toast.error(errorText(error, "Chưa hiện lại được một số bài. Bạn thử lại nhé."));
    },
    onSettled: refresh,
  });

  const archive = useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) =>
      forEach(ids, (id) => api.admin.posts.archive(id, { reason })),
    onSuccess: ({ done, error }) => {
      if (done.length > 0) {
        toast(`Đã ẩn ${count(done)}`, {
          description: "Tác giả thấy lý do trên bài của mình.",
          action: { label: "Hoàn tác", onClick: () => restore.mutate(done) },
        });
      }
      if (error) toast.error(errorText(error, "Chưa ẩn được một số bài. Bạn thử lại nhé."));
    },
    onSettled: refresh,
  });

  const remove = useMutation({
    mutationFn: (ids: string[]) => forEach(ids, (id) => api.admin.posts.remove(id)),
    onSuccess: ({ done, error }) => {
      if (done.length > 0) toast(`Đã xóa ${count(done)}`);
      if (error) toast.error(errorText(error, "Chưa xóa được một số bài. Bạn thử lại nhé."));
    },
    onSettled: refresh,
  });

  return { archive, restore, remove };
}
