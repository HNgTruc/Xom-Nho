import { MEDIA_KINDS, type MediaItem } from "@xom-nho/api";
import { cn } from "@xom-nho/ui/lib/utils";
import { Play } from "lucide-react";
import Image from "next/image";
import { mediaUrl } from "@/lib/media-url";

/** Số ô tối đa trên thẻ bài; còn nữa thì ô cuối ghi "+N". */
const GRID_MAX = 4;

const imageAlt = (index: number, total: number, authorName: string) =>
  total > 1 ? `Ảnh ${index + 1} trong bài của ${authorName}` : `Ảnh trong bài của ${authorName}`;

/** Bố cục lưới theo số ô (như mạng xã hội): 1 ô rộng, 2 ô đôi, 3 ô (một lớn bên trái), 4 ô vuông 2x2. */
const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 grid-rows-2",
  4: "grid-cols-2 grid-rows-2",
};

/**
 * Lưới ảnh, video trên thẻ bài (MASTER mục 7). Nằm dưới lớp liên kết phủ thẻ, nên bấm vào ô nào cũng mở bài.
 * Video chỉ hiện khung đầu và biểu tượng phát; xem ở trang bài. Ảnh lấy thẳng từ backend (`unoptimized`).
 */
export function PostMediaGrid({ media, authorName }: { media: MediaItem[]; authorName: string }) {
  if (media.length === 0) return null;
  const shown = media.slice(0, GRID_MAX);
  const extra = media.length - shown.length;
  const imageCount = media.filter((item) => item.kind === MEDIA_KINDS.IMAGE).length;

  return (
    <div
      className={cn(
        "grid gap-1 overflow-hidden rounded-lg",
        GRID_CLASS[shown.length],
        shown.length === 1 ? "aspect-video" : "aspect-[4/3] sm:aspect-[16/10]",
      )}
    >
      {shown.map((item, index) => {
        const last = index === shown.length - 1;
        return (
          <div
            key={item.id}
            className={cn(
              "relative min-h-0 overflow-hidden bg-muted",
              shown.length === 3 && index === 0 && "row-span-2",
            )}
          >
            {item.kind === MEDIA_KINDS.VIDEO ? (
              <>
                <video
                  src={`${mediaUrl(item.id)}#t=0.1`}
                  preload="metadata"
                  muted
                  playsInline
                  tabIndex={-1}
                  aria-label={`Video trong bài của ${authorName}`}
                  className="size-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-1/2 inline-flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <Play className="size-6 translate-x-0.5" fill="currentColor" />
                </span>
              </>
            ) : (
              <Image
                src={mediaUrl(item.id)}
                alt={imageAlt(index, imageCount, authorName)}
                fill
                unoptimized
                sizes="(min-width: 860px) 400px, 50vw"
                className="object-cover"
              />
            )}
            {last && extra > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-semibold text-white">
                +{extra}
                <span className="sr-only"> ảnh, video nữa</span>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Ảnh, video đầy đủ ở trang bài: xếp dọc theo thứ tự, ảnh giữ tỉ lệ (không cắt), video có nút điều khiển và
 * tua được (backend hỗ trợ Range).
 */
export function PostMediaGallery({
  media,
  authorName,
}: {
  media: MediaItem[];
  authorName: string;
}) {
  if (media.length === 0) return null;
  const imageCount = media.filter((item) => item.kind === MEDIA_KINDS.IMAGE).length;
  let imageIndex = 0;

  return (
    <section aria-label="Ảnh và video" className="flex flex-col gap-3">
      {media.map((item) =>
        item.kind === MEDIA_KINDS.VIDEO ? (
          // Video người dùng tự tải lên, không có file phụ đề để gắn <track>
          // oxlint-disable-next-line jsx-a11y/media-has-caption
          <video
            key={item.id}
            src={mediaUrl(item.id)}
            controls
            preload="metadata"
            playsInline
            aria-label={`Video trong bài của ${authorName}`}
            className="max-h-[80vh] w-full rounded-lg bg-black"
          />
        ) : (
          <Image
            key={item.id}
            src={mediaUrl(item.id)}
            alt={imageAlt(imageIndex++, imageCount, authorName)}
            width={1200}
            height={900}
            unoptimized
            className="h-auto max-h-[80vh] w-full rounded-lg bg-muted object-contain"
          />
        ),
      )}
    </section>
  );
}
