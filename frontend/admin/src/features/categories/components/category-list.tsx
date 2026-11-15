import {
  type Announcements,
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  type Modifier,
  PointerSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AdminCategory } from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { CategoryMark } from "@xom-nho/ui/components/category-mark";
import { cn } from "@xom-nho/ui/lib/utils";
import { GripVertical } from "lucide-react";
import type { CSSProperties } from "react";

const numberFormat = new Intl.NumberFormat("vi-VN");

/** Chỉ kéo theo chiều dọc: danh sách một cột, kéo lệch sang ngang không có nghĩa gì. */
const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

const INSTRUCTIONS =
  "Để đổi chỗ: nhấn phím cách để nhấc danh mục lên, dùng mũi tên lên xuống để di chuyển, nhấn phím cách lần nữa để thả, hoặc Esc để hủy.";

function SortableRow({
  category,
  index,
  maxPosts,
  selected,
  disabled,
  onEdit,
}: {
  category: AdminCategory;
  index: number;
  maxPosts: number;
  selected: boolean;
  disabled: boolean;
  onEdit: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id, disabled });
  const style: CSSProperties = {
    // Translate, không Transform: không co giãn hàng khi các hàng cao khác nhau
    transform: CSS.Translate.toString(transform),
    transition,
    "--stagger": Math.min(index, 6),
  } as CSSProperties;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn("animate-rise-in relative", isDragging && "z-10")}
    >
      <div
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg py-2 pr-2 pl-1 transition-colors duration-120",
          selected ? "bg-accent/28" : "hover:bg-foreground/5",
          isDragging && "glass-strong shadow-glass-hover",
        )}
      >
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={`Kéo để đổi chỗ ${category.name}`}
          disabled={disabled}
          {...attributes}
          {...listeners}
          className="grid size-10 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted-foreground outline-none hover:bg-foreground/6 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
        <CategoryMark color={category.color} icon={category.icon} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold">{category.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {category.description || "Chưa có mô tả"}
          </span>
        </div>
        <div className="flex w-24 shrink-0 flex-col items-end gap-1 max-sm:hidden">
          <span className="text-xs text-muted-foreground tabular-nums">
            {numberFormat.format(category.totalPostCount)} bài
          </span>
          {/* Thanh số bài so với danh mục nhiều bài nhất; chỉ để nhìn, số đã có bằng chữ */}
          <span aria-hidden="true" className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary/42"
              style={{ width: `${maxPosts ? (category.totalPostCount / maxPosts) * 100 : 0}%` }}
            />
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          aria-pressed={selected}
          aria-label={`Sửa danh mục ${category.name}`}
          onClick={onEdit}
        >
          Sửa
        </Button>
      </div>
    </li>
  );
}

/**
 * Danh sách danh mục theo thứ tự menu Chủ đề (pages/admin.md "Danh mục"): tay cầm kéo bằng chuột, ngón tay, hoặc
 * phím (cách để nhấc, mũi tên để di chuyển). Thả xong thì đổi chỗ ngay và gửi thứ tự mới. Trình đọc màn hình được
 * báo vị trí khi nhấc, di chuyển, thả.
 */
export function CategoryList({
  categories,
  selectedId,
  saving,
  onEdit,
  onReorder,
}: {
  categories: AdminCategory[];
  selectedId: string | null;
  /** Đang lưu thứ tự: khóa tay cầm để không gửi chồng hai thứ tự */
  saving: boolean;
  onEdit: (category: AdminCategory) => void;
  onReorder: (next: AdminCategory[]) => void;
}) {
  const sensors = useSensors(
    // Kéo quá 4px mới tính là kéo, để chạm nhẹ vào tay cầm không làm nhảy hàng
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const maxPosts = Math.max(0, ...categories.map((category) => category.totalPostCount));
  const total = categories.length;
  const indexOf = (id: UniqueIdentifier) => categories.findIndex((category) => category.id === id);
  const nameOf = (id: UniqueIdentifier) =>
    categories.find((category) => category.id === id)?.name ?? "danh mục";

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      `Đã nhấc ${nameOf(active.id)}, đang ở vị trí ${indexOf(active.id) + 1} trên ${total}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${nameOf(active.id)} chuyển tới vị trí ${indexOf(over.id) + 1} trên ${total}.`
        : `${nameOf(active.id)} đang nằm ngoài danh sách.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `Đã thả ${nameOf(active.id)} ở vị trí ${indexOf(over.id) + 1} trên ${total}.`
        : `Đã thả ${nameOf(active.id)}, thứ tự không đổi.`,
    onDragCancel: ({ active }) =>
      `Đã hủy. ${nameOf(active.id)} về lại vị trí ${indexOf(active.id) + 1}.`,
  };

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(categories, indexOf(active.id), indexOf(over.id)));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[verticalOnly]}
      onDragEnd={onDragEnd}
      accessibility={{ announcements, screenReaderInstructions: { draggable: INSTRUCTIONS } }}
    >
      <SortableContext
        items={categories.map((category) => category.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol aria-label="Danh mục theo thứ tự menu Chủ đề" className="flex flex-col gap-1">
          {categories.map((category, index) => (
            <SortableRow
              key={category.id}
              category={category}
              index={index}
              maxPosts={maxPosts}
              selected={category.id === selectedId}
              disabled={saving}
              onEdit={() => onEdit(category)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
