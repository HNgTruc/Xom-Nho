import { Input } from "@xom-nho/ui/components/input";
import { cn } from "@xom-nho/ui/lib/utils";
import { Search } from "lucide-react";
import { useId } from "react";

/**
 * Ô tìm trong thanh lọc của bảng: biểu tượng kính lúp, nhãn ẩn cho trình đọc màn hình. Chỉ hiện chữ;
 * trạng thái và debounce do `useTableSearch` lo. `className` cho khung ngoài (bề rộng tối thiểu).
 */
export function TableSearch({
  label,
  placeholder,
  value,
  onValueChange,
  className,
}: {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("relative flex-1", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  );
}
