import { cn } from "@xom-nho/ui/lib/utils";

/**
 * Nhóm nút chọn một (khoảng thời gian "7 ngày / 30 ngày / Tất cả", số dòng "20 / 30"): thanh `glass-button` viên
 * thuốc, mục đang chọn là `glass-primary` như thanh tab (MASTER 2.4). Là nhóm nút bật tắt (`aria-pressed`), không
 * phải tab: đổi lựa chọn chỉ lọc lại dữ liệu ngay bên dưới, không chuyển vùng nội dung.
 */
export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  /** Tên nhóm cho trình đọc màn hình ("Khoảng thời gian") */
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="glass-button m-0 inline-flex w-fit min-w-0 items-center gap-1 rounded-full border border-glass-border-hover p-1">
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              // Cao 40px: ngoài dòng bảng vẫn theo MASTER (≥ 40px), chỉ nút trong dòng bảng được 32px (admin.md)
              "inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-120 outline-none hover:bg-glass-button-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // Màu chữ chỉ đặt một lần theo trạng thái: để `text-foreground` chung thì nó đè chữ của `glass-primary`
              active
                ? "glass-primary text-primary-foreground hover:bg-glass-primary-hover"
                : "text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
