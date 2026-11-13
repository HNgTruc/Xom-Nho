import { CONTENT_FORMATS, formatDateTime, POST_STATUSES } from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Badge } from "@xom-nho/ui/components/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/features/auth";
import { CommentSection, CommentSectionSkeleton } from "@/features/comments";
import { MarkdownContent, renderMarkdown } from "@/lib/markdown";
import { getCategories } from "../api/get-category";
import { getPost } from "../api/get-post";
import { initials } from "@/lib/initials";
import { userAvatarSrc } from "@/lib/media-url";
import { requestTime } from "@/lib/request-time";
import { CategoryBadge } from "./category-badge";
import { PlainContent } from "./plain-content";
import { PostActions } from "./post-actions";
import { PostEngagement } from "./post-engagement";
import { PostMediaGallery } from "./post-media";
import { PostStatusNote } from "./post-status-note";
import { TableOfContents } from "./table-of-contents";
import { ViewTracker } from "./view-tracker";

const numberFormat = new Intl.NumberFormat("vi-VN");

/**
 * Trang bài viết (MASTER mục 7, thread view): danh mục, tiêu đề, tác giả và ngày, mục lục nếu bài dài,
 * nội dung Markdown font Lora, danh sách thẻ, rồi khối bình luận (tải sau, không giữ chân bài). Cả bài nằm trên
 * kính đặc (MASTER 2.4) để đọc lâu không mỏi.
 * Chỉ cho thành viên (ADR 0007). Đọc `params` và cookie nên phải nằm trong `<Suspense>`.
 * Không có hoặc không được xem thì 404. Tác giả có menu "…" (Sửa bài, Xóa bài) cạnh badge danh mục; xóa xong về
 * trang chủ.
 */
export async function PostDetailView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const viewer = await requireUser(`/bai-viet/${slug}`);
  const [post, now] = await Promise.all([getPost(slug), requestTime()]);
  if (!post) notFound();
  const own = post.author.id === viewer.id;
  // Danh mục chỉ cần cho hộp sửa bài (đã `cache`: header gọi rồi)
  const categories = own ? await getCategories().catch(() => []) : [];

  // Bài soạn kiểu mạng xã hội là chữ thường: không qua Markdown, không có mục lục
  const plain = post.contentFormat === CONTENT_FORMATS.PLAIN;
  const markdown = plain ? null : renderMarkdown(post.content);
  const published = post.status === POST_STATUSES.PUBLISHED;

  return (
    <article className="glass-strong flex animate-rise-in flex-col gap-8 rounded-xl p-5 sm:p-8">
      <header className="flex flex-col gap-4">
        <PostStatusNote post={post} />
        <div className="flex items-center justify-between gap-2">
          <CategoryBadge category={post.category} />
          {own && (
            <PostActions
              post={{ id: post.id, slug: post.slug }}
              author={{ name: post.author.name, image: userAvatarSrc(post.author) }}
              categories={categories}
              detail={post}
              afterDelete="/"
              className="-my-2 -mr-2"
            />
          )}
        </div>
        {post.title ? (
          <h1 className="text-3xl font-bold md:text-4xl">{post.title}</h1>
        ) : (
          <h1 className="sr-only">Bài của {post.author.name}</h1>
        )}

        {/* Hai dòng: tên ở trên, giờ đăng và lượt đọc ở dưới, để giờ cụ thể ("16:20, 13 tháng 11") không đẩy
            dấu "·" xuống dòng lơ lửng trên điện thoại */}
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={userAvatarSrc(post.author) ?? undefined} alt="" />
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="text-base font-medium text-foreground">{post.author.name}</span>
            {(post.publishedAt || published) && (
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>{formatDateTime(post.publishedAt, now)}</time>
                )}
                {post.publishedAt && published && <span aria-hidden="true">·</span>}
                {published && <span>{numberFormat.format(post.viewCount)} lượt đọc</span>}
              </p>
            )}
          </div>
        </div>
      </header>

      {markdown ? (
        <>
          <TableOfContents items={markdown.toc} />
          <MarkdownContent>{markdown.element}</MarkdownContent>
        </>
      ) : (
        <PlainContent text={post.content} />
      )}

      <PostMediaGallery media={post.media} authorName={post.author.name} />

      {post.tags.length > 0 && (
        // Không kẻ đường trên tag: ngay dưới đã có hai đường kẻ ôm hàng Thích, Bình luận, Chia sẻ
        <footer>
          <h2 className="sr-only">Thẻ</h2>
          <ul className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag.slug}>
                <Badge asChild variant="outline" className="h-8 px-3">
                  <Link href={`/tag/${tag.slug}`}>{tag.name}</Link>
                </Badge>
              </li>
            ))}
          </ul>
        </footer>
      )}

      <PostEngagement
        postId={post.id}
        slug={post.slug}
        shareTitle={post.title || `Bài của ${post.author.name}`}
        like={{ liked: post.likedByMe, likeCount: post.likeCount }}
        commentCount={post.commentCount}
        commentsHref="#binh-luan"
        showCommentCount={false}
      />

      {/* Đích của nút Bình luận (`#binh-luan`); chừa chỗ cho header dính khi cuộn tới */}
      <div id="binh-luan" className="scroll-mt-32">
        <Suspense fallback={<CommentSectionSkeleton />}>
          <CommentSection postId={post.id} canComment={published} />
        </Suspense>
      </div>

      {/* Chỉ bài đã đăng mới tính lượt xem (backend cũng chặn) */}
      {published && <ViewTracker postId={post.id} />}
    </article>
  );
}
