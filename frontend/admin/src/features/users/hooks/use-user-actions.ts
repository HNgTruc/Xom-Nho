import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AdminUserListItem, ROLE_LABELS, type Role } from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { toast } from "@xom-nho/ui/components/toaster";
import { api } from "@/lib/api";
import { adminUsersKeys } from "../api/users.queries";

const errorText = (error: unknown, fallback: string) =>
  isApiError(error) ? error.message : fallback;

/**
 * Đổi vai trò, cấm, bỏ cấm (docs/tinh-nang.md mục 4.5, docs/phan-quyen.md "Trưởng xóm quản lý thành viên"). Backend
 * chặn tự đổi vai trò, tự cấm, cấm trưởng xóm khác (403); lỗi đó hiện nguyên câu của backend. Xong thì báo bằng
 * toast có "Hoàn tác" (về vai trò cũ, bỏ cấm).
 */
export function useUserActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });

  const setRole = useMutation({
    mutationFn: ({ user, role }: { user: AdminUserListItem; role: Role }) =>
      api.admin.users.setRole(user.id, { role }),
    onSuccess: (_, { user, role }) => {
      toast(`Đã đổi ${user.name} thành ${ROLE_LABELS[role]}`, {
        action: {
          label: "Hoàn tác",
          onClick: () => setRole.mutate({ user: { ...user, role }, role: user.role }),
        },
      });
    },
    onError: (error) => toast.error(errorText(error, "Chưa đổi được vai trò. Bạn thử lại nhé.")),
    onSettled: refresh,
  });

  const unban = useMutation({
    mutationFn: (user: AdminUserListItem) => api.admin.users.unban(user.id),
    onSuccess: (_, user) => toast(`Đã bỏ cấm ${user.name}`),
    onError: (error) => toast.error(errorText(error, "Chưa bỏ cấm được. Bạn thử lại nhé.")),
    onSettled: refresh,
  });

  const ban = useMutation({
    mutationFn: ({
      user,
      reason,
      expiresAt,
    }: {
      user: AdminUserListItem;
      reason: string;
      expiresAt: string | null;
    }) => api.admin.users.ban(user.id, { reason, expiresAt }),
    onSuccess: (_, { user }) => {
      toast(`Đã cấm tài khoản ${user.name}`, {
        description: "Người này đã bị đăng xuất ở mọi thiết bị.",
        action: { label: "Hoàn tác", onClick: () => unban.mutate(user) },
      });
    },
    onError: (error) => toast.error(errorText(error, "Chưa cấm được. Bạn thử lại nhé.")),
    onSettled: refresh,
  });

  return { setRole, ban, unban };
}
