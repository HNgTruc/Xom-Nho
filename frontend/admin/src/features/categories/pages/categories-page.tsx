import { useQuery } from "@tanstack/react-query";
import type { AdminCategory } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@xom-nho/ui/components/sheet";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { MousePointerClick, Plus, Shapes } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState, ErrorState } from "@/components/common/state-message";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUrlState } from "@/hooks/use-url-state";
import { adminCategoriesQuery } from "../api/categories.queries";
import { CategoryForm } from "../components/category-form";
import { CategoryList } from "../components/category-list";
import { useCategoryActions } from "../hooks/use-category-actions";

/** Giá trị `?sua=` khi đang thêm danh mục mới. */
const NEW = "moi";

/**
 * Màn Danh mục (docs/tinh-nang.md mục 4.4, pages/admin.md "Danh mục"): danh sách theo thứ tự menu Chủ đề, kéo để
 * đổi chỗ; khung sửa nằm cạnh danh sách từ 1024px, dưới đó mở thành ngăn kéo. Danh mục đang sửa nằm trên URL
 * (`?sua=<id>` hoặc `?sua=moi`) để tải lại vẫn mở đúng chỗ.
 */
export function CategoriesPage() {
  const { params, set } = useUrlState();
  const wide = useMediaQuery("(min-width: 1024px)");
  const query = useQuery(adminCategoriesQuery);
  const actions = useCategoryActions();
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);

  const categories = query.data;
  const editingId = params.sua ?? null;
  const adding = editingId === NEW;
  const selected = categories?.find((category) => category.id === editingId) ?? null;
  // `?sua=` trỏ tới danh mục không còn (vừa xóa, link cũ) thì coi như không sửa gì
  const open = adding || selected !== null;
  const close = () => set({ sua: undefined }, { resetPage: false });
  const openEditor = (value: string) => set({ sua: value }, { resetPage: false });

  const title = adding ? "Thêm danh mục" : selected ? `Sửa danh mục “${selected.name}”` : "";
  const form = open && (
    <CategoryForm
      // Đổi danh mục thì dựng lại form với giá trị của danh mục mới
      key={selected?.id ?? NEW}
      category={selected}
      pending={actions.create.isPending || actions.update.isPending}
      onCancel={close}
      onDelete={setDeleting}
      onSubmit={async (input) => {
        if (selected) {
          await actions.update.mutateAsync({ id: selected.id, input });
        } else {
          const { data } = await actions.create.mutateAsync(input);
          openEditor(data.id);
        }
      }}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <PageHeader
        title="Danh mục"
        description="Thứ tự ở đây là thứ tự trong menu Chủ đề. Kéo tay cầm, hoặc nhấn phím cách rồi dùng mũi tên, để đổi chỗ."
        actions={
          <Button onClick={() => openEditor(NEW)} aria-pressed={adding}>
            <Plus aria-hidden="true" />
            Thêm danh mục
          </Button>
        }
      />

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <section aria-label="Danh sách danh mục" className="glass-strong rounded-xl p-2">
          {query.isPending ? (
            <div className="flex flex-col gap-1 p-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : query.isError ? (
            <ErrorState onRetry={() => void query.refetch()} />
          ) : query.data.length === 0 ? (
            <EmptyState
              icon={Shapes}
              title="Chưa có danh mục nào"
              description="Bài viết cần danh mục để đăng. Thêm danh mục đầu tiên nhé."
              action={<Button onClick={() => openEditor(NEW)}>Thêm danh mục</Button>}
            />
          ) : (
            <CategoryList
              categories={query.data}
              selectedId={selected?.id ?? null}
              saving={actions.reorder.isPending}
              onEdit={(category) => openEditor(category.id)}
              onReorder={(next) => actions.reorder.mutate(next)}
            />
          )}
        </section>

        {wide ? (
          <section
            aria-labelledby="khung-sua"
            className="glass-strong sticky top-20 flex flex-col gap-4 rounded-xl p-5"
          >
            {open ? (
              <>
                <h2 id="khung-sua" className="text-lg font-semibold">
                  {title}
                </h2>
                {form}
              </>
            ) : (
              <>
                <h2 id="khung-sua" className="sr-only">
                  Sửa danh mục
                </h2>
                <EmptyState
                  icon={MousePointerClick}
                  title="Chọn một danh mục để sửa"
                  description="Bấm Sửa ở một dòng, hoặc Thêm danh mục để tạo mới."
                />
              </>
            )}
          </section>
        ) : (
          <Sheet open={open} onOpenChange={(next) => !next && close()}>
            <SheetContent
              side="right"
              className="w-[min(30rem,100vw)]! gap-0 overflow-y-auto p-5 pt-4"
            >
              <SheetTitle className="pr-12 text-lg font-semibold">{title}</SheetTitle>
              <SheetDescription className="mb-4 text-sm text-muted-foreground">
                Tên, mô tả, màu và biểu tượng hiện trong menu Chủ đề và trên thẻ bài.
              </SheetDescription>
              {form}
            </SheetContent>
          </Sheet>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(next) => !next && setDeleting(null)}
        title={deleting ? `Xóa danh mục ${deleting.name}?` : ""}
        description="Danh mục biến mất khỏi menu Chủ đề, đường dẫn tới trang danh mục không còn mở được. Không hoàn tác được."
        confirmLabel="Xóa danh mục"
        destructive
        onConfirm={async () => {
          if (!deleting) return;
          await actions.remove.mutateAsync(deleting);
          close();
        }}
      />
    </div>
  );
}
