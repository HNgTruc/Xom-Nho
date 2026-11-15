import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminCategory, CategoryInput } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { toast } from "@xom-nho/ui/components/toaster";
import { adminPostsKeys } from "@/features/posts";
import { api } from "@/lib/api";
import { adminCategoriesKeys } from "../api/categories.queries";

const errorText = (error: unknown, fallback: string) =>
  isApiError(error) ? error.message : fallback;

/**
 * Thêm, sửa, sắp xếp, xóa danh mục (docs/tinh-nang.md mục 4.4). Xong thì làm mới cả danh sách ở đây, bộ lọc danh
 * mục và bảng bài (tên danh mục hiện trên từng dòng). Sắp xếp đổi chỗ ngay trên màn hình rồi mới gửi; lỗi thì về
 * thứ tự cũ và báo.
 */
export function useCategoryActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminCategoriesKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
      queryClient.invalidateQueries({ queryKey: adminPostsKeys.all }),
    ]);

  // Lỗi của form (tên trùng, ô sai) hiện ngay dưới ô ở khung sửa, nên không bật toast ở đây
  const create = useMutation({
    mutationFn: (input: CategoryInput) => api.admin.categories.create(input),
    onSuccess: ({ data }) => toast(`Đã thêm danh mục ${data.name}`),
    onSettled: refresh,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) =>
      api.admin.categories.update(id, input),
    onSuccess: ({ data }) => toast(`Đã lưu danh mục ${data.name}`),
    onSettled: refresh,
  });

  const reorder = useMutation({
    mutationFn: (next: AdminCategory[]) =>
      api.admin.categories.reorder({ ids: next.map((category) => category.id) }),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: adminCategoriesKeys.all });
      const previous = queryClient.getQueryData<AdminCategory[]>(adminCategoriesKeys.all);
      queryClient.setQueryData(adminCategoriesKeys.all, next);
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(adminCategoriesKeys.all, context.previous);
      toast.error(errorText(error, "Chưa lưu được thứ tự. Bạn thử lại nhé."));
    },
    onSettled: refresh,
  });

  const remove = useMutation({
    mutationFn: (category: AdminCategory) => api.admin.categories.remove(category.id),
    onSuccess: (_, category) => toast(`Đã xóa danh mục ${category.name}`),
    onError: (error) => toast.error(errorText(error, "Chưa xóa được danh mục. Bạn thử lại nhé.")),
    onSettled: refresh,
  });

  return { create, update, reorder, remove };
}
