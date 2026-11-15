import { useQuery } from "@tanstack/react-query";
import { ADMIN_TAG_SORTS, type AdminTag } from "@xom-nho/api";
import { Input } from "@xom-nho/ui/components/input";
import { Skeleton } from "@xom-nho/ui/components/skeleton";
import { cn } from "@xom-nho/ui/lib/utils";
import { Search } from "lucide-react";
import { useId, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { adminTagsListQuery } from "../api/tags.queries";

const numberFormat = new Intl.NumberFormat("vi-VN");
const PICKER_SIZE = 8;

/**
 * Chọn thẻ đích để gộp: ô tìm (có dấu hay không đều được) và tối đa 8 thẻ khớp, nhiều bài trước, không có thẻ đang
 * gộp. Là nhóm radio thật (`fieldset` + `input type="radio"`) nên đi bằng mũi tên, trình đọc màn hình đọc đúng.
 */
export function MergeTargetPicker({
  source,
  value,
  onChange,
}: {
  source: AdminTag;
  value: AdminTag | null;
  onChange: (tag: AdminTag) => void;
}) {
  const id = useId();
  const [search, setSearch] = useState("");
  const q = useDebouncedValue(search).trim();
  const query = useQuery(
    adminTagsListQuery({
      q: q || undefined,
      sort: ADMIN_TAG_SORTS.POSTS,
      pageSize: PICKER_SIZE + 1,
    }),
  );
  const options = (query.data?.data ?? [])
    .filter((tag) => tag.id !== source.id)
    .slice(0, PICKER_SIZE);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <label htmlFor={`${id}-search`} className="sr-only">
          Tìm thẻ đích
        </label>
        <Input
          id={`${id}-search`}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm thẻ để gộp vào"
          className="pl-9"
          autoComplete="off"
        />
      </div>
      <fieldset className="flex max-h-64 flex-col gap-1 overflow-y-auto">
        <legend className="sr-only">Thẻ đích</legend>
        {query.isPending ? (
          Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-11 w-full" />)
        ) : options.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">
            {q ? "Không có thẻ nào khớp." : "Chưa có thẻ nào khác để gộp vào."}
          </p>
        ) : (
          options.map((tag) => {
            const checked = value?.id === tag.id;
            return (
              <label
                key={tag.id}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-120 hover:bg-foreground/5 has-focus-visible:ring-2 has-focus-visible:ring-ring",
                  checked && "bg-accent/28 hover:bg-accent/28",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-target`}
                  value={tag.id}
                  checked={checked}
                  onChange={() => onChange(tag)}
                  className="size-4 accent-primary"
                />
                <span className="min-w-0 flex-1 truncate font-medium">{tag.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {numberFormat.format(tag.postCount)} bài
                </span>
              </label>
            );
          })
        )}
      </fieldset>
    </div>
  );
}
