import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isApiError } from "@xom-nho/api/api-client";
import { toast } from "@xom-nho/ui/components/toaster";
import { adminPostsKeys } from "@/features/posts";
import { api } from "@/lib/api";
import { adminCommentsKeys } from "../api/comments.queries";

async function forEach(ids: string[], action: (id: string) => Promise<unknown>) {
  const results = await Promise.allSettled(ids.map((id) => action(id)));
  const failed = results.find((result) => result.status === "rejected");
  return {
    done: ids.filter((_, index) => results[index]?.status === "fulfilled"),
    error: failed?.status === "rejected" ? failed.reason : null,
  };
}

const count = (ids: string[]) => (ids.length === 1 ? "bình luận" : `${ids.length} bình luận`);
const errorText = (error: unknown, fallback: string) =>
  isApiError(error) ? error.message : fallback;

/**
 * Ẩn, hiện lại, xóa bình luận (docs/tinh-nang.md mục 4.3): xong thì làm mới bảng bình luận và bảng bài (số bình
 * luận đổi), báo bằng toast; ẩn có "Hoàn tác". Xóa đã hỏi lại trước (xóa cả trả lời bên dưới, không lấy lại được).
 */
export function useCommentActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminCommentsKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminPostsKeys.all }),
    ]);

  const show = useMutation({
    mutationFn: (ids: string[]) => forEach(ids, (id) => api.admin.comments.show(id)),
    onSuccess: ({ done, error }) => {
      if (done.length > 0) toast(`Đã hiện lại ${count(done)}`);
      if (error)
        toast.error(errorText(error, "Chưa hiện lại được một số bình luận. Bạn thử lại nhé."));
    },
    onSettled: refresh,
  });

  const hide = useMutation({
    mutationFn: (ids: string[]) => forEach(ids, (id) => api.admin.comments.hide(id)),
    onSuccess: ({ done, error }) => {
      if (done.length > 0) {
        toast(`Đã ẩn ${count(done)}`, {
          description: "Chỉ trưởng xóm còn thấy, kể cả người viết cũng không thấy.",
          action: { label: "Hoàn tác", onClick: () => show.mutate(done) },
        });
      }
      if (error) toast.error(errorText(error, "Chưa ẩn được một số bình luận. Bạn thử lại nhé."));
    },
    onSettled: refresh,
  });

  const remove = useMutation({
    mutationFn: (ids: string[]) => forEach(ids, (id) => api.admin.comments.remove(id)),
    onSuccess: ({ done, error }) => {
      if (done.length > 0) toast(`Đã xóa ${count(done)}`);
      if (error) toast.error(errorText(error, "Chưa xóa được một số bình luận. Bạn thử lại nhé."));
    },
    onSettled: refresh,
  });

  return { hide, show, remove };
}
