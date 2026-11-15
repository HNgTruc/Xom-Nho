import {
  type AdminCategory,
  CATEGORY_COLOR_VALUES,
  CATEGORY_ICON_VALUES,
  type CategoryColor,
  type CategoryIcon as CategoryIconKey,
  type CategoryInput,
  categoryInputSchema,
  LIMITS,
} from "@xom-nho/api";
import { isApiError } from "@xom-nho/api/api-client";
import { Badge } from "@xom-nho/ui/components/badge";
import { Button } from "@xom-nho/ui/components/button";
import { CategoryIcon } from "@xom-nho/ui/components/category-icon";
import {
  CategoryMark,
  categoryBadgeClass,
  categoryDotClass,
} from "@xom-nho/ui/components/category-mark";
import { FieldError } from "@xom-nho/ui/components/field-error";
import { FormAlert } from "@xom-nho/ui/components/form-alert";
import { Input } from "@xom-nho/ui/components/input";
import { Label } from "@xom-nho/ui/components/label";
import { Textarea } from "@xom-nho/ui/components/textarea";
import { cn } from "@xom-nho/ui/lib/utils";
import { Check, Trash2 } from "lucide-react";
import { type FormEvent, useId, useState } from "react";
import { COLOR_LABELS, ICON_LABELS, NO_ICON_LABEL } from "../lib/labels";

type Errors = Partial<Record<"name" | "description" | "form", string>>;

const optionClass =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-glass-border-hover transition-colors duration-120 outline-none hover:bg-foreground/6 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-pressed:border-foreground aria-pressed:bg-foreground/8";

/** Giá trị ban đầu của form: danh mục đang sửa, hoặc mặc định khi thêm (màu đầu tiên, chưa có biểu tượng). */
function initialValues(category: AdminCategory | null): CategoryInput {
  return {
    name: category?.name ?? "",
    description: category?.description ?? "",
    color: category?.color ?? CATEGORY_COLOR_VALUES[0],
    icon: category?.icon ?? null,
  };
}

/**
 * Xem trước ba chỗ danh mục hiện ra trên web (pages/admin.md "Danh mục"): đầu trang danh mục, mục trong menu Chủ
 * đề, badge trên thẻ bài. Dựng bằng đúng component web dùng (`CategoryMark`, màu badge) nên khớp với thật.
 */
function Preview({ values }: { values: CategoryInput }) {
  const name = values.name.trim() || "Tên danh mục";
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <p className="text-xs font-medium text-muted-foreground">Xem trước</p>
      <div className="flex items-center gap-3">
        <CategoryMark color={values.color} icon={values.icon} size="lg" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xl font-semibold">{name}</span>
          <span className="line-clamp-2 text-sm text-muted-foreground">
            {values.description?.trim() || "Mô tả hiện dưới tên ở đầu trang danh mục"}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
        <span className="flex min-h-11 items-center gap-3 rounded-md py-1.5 pr-3 pl-1.5 text-base">
          <CategoryMark color={values.color} icon={values.icon} />
          {name}
        </span>
        <Badge variant="ghost" className={categoryBadgeClass(values.color)}>
          {name}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        Đầu trang danh mục · mục trong menu Chủ đề · badge trên thẻ bài
      </p>
    </div>
  );
}

/**
 * Khung thêm, sửa danh mục (pages/admin.md "Danh mục"): tên, mô tả, 5 màu có tên bằng chữ, 5 biểu tượng và "không
 * có" (hiện chấm màu), xem trước. Kiểm tra bằng `categoryInputSchema` (cùng schema backend dùng); tên trùng do
 * backend báo hiện ngay dưới ô tên. Xóa khóa khi còn bài, ghi rõ còn bao nhiêu bài.
 */
export function CategoryForm({
  category,
  pending,
  onSubmit,
  onCancel,
  onDelete,
}: {
  /** `null`: thêm danh mục mới */
  category: AdminCategory | null;
  pending: boolean;
  onSubmit: (input: CategoryInput) => Promise<unknown>;
  onCancel: () => void;
  onDelete: (category: AdminCategory) => void;
}) {
  const id = useId();
  const [values, setValues] = useState(() => initialValues(category));
  const [errors, setErrors] = useState<Errors>({});
  const editing = category !== null;

  function set<K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = categoryInputSchema.safeParse(values);
    if (!result.success) {
      const next: Errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "description") next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    try {
      await onSubmit(result.data);
    } catch (error) {
      if (isApiError(error) && error.fields?.name) setErrors({ name: error.fields.name });
      else
        setErrors({
          form: isApiError(error) ? error.message : "Chưa lưu được. Bạn thử lại nhé.",
        });
    }
  }

  const remaining = category?.totalPostCount ?? 0;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <FormAlert message={errors.form ?? null} />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-name`}>Tên</Label>
        <Input
          id={`${id}-name`}
          value={values.name}
          maxLength={LIMITS.CATEGORY_NAME_MAX}
          onChange={(event) => set("name", event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${id}-name-error` : undefined}
          autoComplete="off"
        />
        <FieldError id={`${id}-name-error`}>{errors.name}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-description`}>
          Mô tả{" "}
          <span className="font-normal text-muted-foreground">
            (hiện dưới tên ở đầu trang danh mục)
          </span>
        </Label>
        <Textarea
          id={`${id}-description`}
          rows={2}
          value={values.description ?? ""}
          maxLength={LIMITS.CATEGORY_DESCRIPTION_MAX}
          onChange={(event) => set("description", event.target.value)}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? `${id}-description-error` : undefined}
        />
        <FieldError id={`${id}-description-error`}>{errors.description}</FieldError>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Màu</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_COLOR_VALUES.map((color: CategoryColor) => {
            const active = values.color === color;
            return (
              <button
                key={color}
                type="button"
                aria-pressed={active}
                onClick={() => set("color", color)}
                className={cn(optionClass, "h-10 gap-2 pr-4 pl-2 text-sm font-medium")}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-background",
                    categoryDotClass(color),
                  )}
                >
                  {active && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                {COLOR_LABELS[color]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Biểu tượng</legend>
        <div className="flex flex-wrap gap-2">
          {[...CATEGORY_ICON_VALUES, null].map((icon: CategoryIconKey | null) => {
            const label = icon ? ICON_LABELS[icon] : NO_ICON_LABEL;
            return (
              <button
                key={icon ?? "none"}
                type="button"
                aria-pressed={values.icon === icon}
                aria-label={label}
                title={label}
                onClick={() => set("icon", icon)}
                className={cn(optionClass, "size-11")}
              >
                {icon ? (
                  <CategoryIcon icon={icon} className="size-5.5" />
                ) : (
                  <span
                    aria-hidden="true"
                    className={cn("size-2.5 rounded-full", categoryDotClass(values.color))}
                  />
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Preview values={values} />

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {editing ? (
            <Button
              type="button"
              variant="destructive"
              disabled={remaining > 0 || pending}
              aria-describedby={remaining > 0 ? `${id}-delete-note` : undefined}
              onClick={() => onDelete(category)}
            >
              <Trash2 aria-hidden="true" />
              Xóa danh mục
            </Button>
          ) : (
            <span />
          )}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
              Hủy
            </Button>
            <Button type="submit" loading={pending}>
              {editing ? "Lưu thay đổi" : "Thêm danh mục"}
            </Button>
          </div>
        </div>
        {/* Nằm dưới cả hàng nút: câu dài không đẩy "Hủy", "Lưu" lệch xuống dòng */}
        {editing && remaining > 0 && (
          <p id={`${id}-delete-note`} className="text-xs text-muted-foreground tabular-nums">
            Còn {remaining} bài, chuyển hoặc xóa hết bài rồi mới xóa được danh mục.
          </p>
        )}
      </div>
    </form>
  );
}
