import { useQuery } from "@tanstack/react-query";
import { type AdminListUsersQuery, adminListUsersQuerySchema } from "@xom-nho/api";
import { PageHeader } from "@/components/common/page-header";
import { meQuery } from "@/features/auth";
import { useUrlState } from "@/hooks/use-url-state";
import { adminUsersStatsQuery } from "../api/users.queries";
import { UsersTable } from "../components/users-table";

const DEFAULT = adminListUsersQuerySchema.parse({});
const numberFormat = new Intl.NumberFormat("vi-VN");

/** Đọc bộ lọc từ URL; giá trị sai (sửa tay URL) thì về mặc định thay vì vỡ trang. */
function parse(params: Record<string, string>): AdminListUsersQuery {
  const { role, banned, q, page, pageSize } = params;
  const result = adminListUsersQuerySchema.safeParse({ role, banned, q, page, pageSize });
  return result.success ? result.data : DEFAULT;
}

/** Màn Thành viên (docs/tinh-nang.md mục 4.5): tóm tắt số thành viên, bảng có tab vai trò; bộ lọc trên URL. */
export function UsersPage() {
  const { params, set } = useUrlState();
  const me = useQuery(meQuery);
  const stats = useQuery(adminUsersStatsQuery);

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        title="Thành viên"
        description={
          stats.data
            ? `${numberFormat.format(stats.data.total)} thành viên · ${numberFormat.format(stats.data.newLast7Days)} người mới trong 7 ngày`
            : "Đổi vai trò, cấm và bỏ cấm thành viên."
        }
      />
      <UsersTable query={parse(params)} meId={me.data?.id} onChange={set} />
    </div>
  );
}
