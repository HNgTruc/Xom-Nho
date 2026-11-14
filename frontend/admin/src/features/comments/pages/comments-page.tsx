import { type AdminListCommentsQuery, adminListCommentsQuerySchema } from "@xom-nho/api";
import { PageHeader } from "@/components/common/page-header";
import { useUrlState } from "@/hooks/use-url-state";
import { CommentsTable } from "../components/comments-table";

const DEFAULT = adminListCommentsQuerySchema.parse({});

/** Đọc bộ lọc từ URL; giá trị sai (sửa tay URL) thì về mặc định thay vì vỡ trang. */
function parse(params: Record<string, string>): AdminListCommentsQuery {
  const { status, q, post, page, pageSize } = params;
  const result = adminListCommentsQuerySchema.safeParse({ status, q, post, page, pageSize });
  return result.success ? result.data : DEFAULT;
}

/** Màn Bình luận (docs/tinh-nang.md mục 4.3): mọi bình luận, kể cả đã ẩn; bộ lọc nằm trên URL. */
export function CommentsPage() {
  const { params, set } = useUrlState();
  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        title="Bình luận"
        description="Mọi bình luận trong xóm, kể cả bình luận đã ẩn. Mới nhất trước."
      />
      <CommentsTable query={parse(params)} onChange={set} />
    </div>
  );
}
