import { useQuery } from "@tanstack/react-query";
import { type AdminListTagsQuery, adminListTagsQuerySchema } from "@xom-nho/api";
import { PageHeader } from "@/components/common/page-header";
import { useUrlState } from "@/hooks/use-url-state";
import { numberFormat } from "@/lib/format";
import { adminTagsListQuery } from "../api/tags.queries";
import { TagsTable } from "../components/tags-table";

const DEFAULT = adminListTagsQuerySchema.parse({});

/** Đọc bộ lọc từ URL; giá trị sai (sửa tay URL) thì về mặc định thay vì vỡ trang. */
function parse(params: Record<string, string>): AdminListTagsQuery {
  const { q, sort, page, pageSize } = params;
  const result = adminListTagsQuerySchema.safeParse({ q, sort, page, pageSize });
  return result.success ? result.data : DEFAULT;
}

/** Màn Thẻ (docs/tinh-nang.md mục 4.4): gộp thẻ trùng nghĩa, xóa thẻ. Bộ lọc trên URL. */
export function TagsPage() {
  const { params, set } = useUrlState();
  // Tổng số thẻ cho dòng mô tả: cùng khóa với trang đầu không lọc, thường đã có sẵn trong bộ nhớ
  const total = useQuery(adminTagsListQuery(DEFAULT)).data?.meta.total;

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        title="Thẻ"
        description={
          total !== undefined
            ? `${numberFormat.format(total)} thẻ · Gộp thẻ trùng nghĩa, xóa thẻ không dùng.`
            : "Gộp thẻ trùng nghĩa, xóa thẻ không dùng."
        }
      />
      <TagsTable query={parse(params)} onChange={set} />
    </div>
  );
}
