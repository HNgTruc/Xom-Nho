import { CONTENT_FORMATS, formatDate, POST_STATUSES } from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Badge } from "@xom-nho/ui/components/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/features/auth";
import { CommentSection, CommentSectionSkeleton } from "@/features/comments";
import { MarkdownContent, renderMarkdown } from "@/lib/markdown";
import { getPost } from "../api/get-post";
import { initials } from "@/lib/initials";
import { userAvatarSrc } from "@/lib/media-url";
import { CategoryBadge } from "./category-badge";
import { PlainContent } from "./plain-content";
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
 * Không có hoặc không được xem thì 404.
 */
export async function PostDetailView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireUser(`/bai-viet/${slug}`);
  const post = await getPost(slug);
  if (!post) notFound();

  // Bài soạn kiểu mạng xã hội là chữ thường: không qua Markdown, không có mục lục
  const plain = post.contentFormat === CONTENT_FORMATS.PLAIN;
  const markdown = plain ? null : renderMarkdown(post.content);
  const published = post.status === POST_STATUSES.PUBLISHED;

  return (
    <article className="glass-strong flex animate-rise-in flex-col gap-8 rounded-xl p-5 sm:p-8">
      <header className="flex flex-col gap-4">
        <PostStatusNote post={post} />
        <CategoryBadge category={post.category} />
        {post.title ? (
          <h1 className="text-3xl font-bold md:text-4xl">{post.title}</h1>
        ) : (
          <h1 className="sr-only">Bài của {post.author.name}</h1>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <Avatar>
            <AvatarImage src={userAvatarSrc(post.author) ?? undefined} alt="" />
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>
          <span className="text-base font-medium text-foreground">{post.author.name}</span>
          {post.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </>
          )}
          {published && (
            <>
              <span aria-hidden="true">·</span>
              <span>{numberFormat.format(post.viewCount)} lượt đọc</span>
            </>
          )}
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
        <footer className="border-t border-border pt-6">
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

      <Suspense fallback={<CommentSectionSkeleton />}>
        <CommentSection postId={post.id} canComment={published} />
      </Suspense>

      {/* Chỉ bài đã đăng mới tính lượt xem (backend cũng chặn) */}
      {published && <ViewTracker postId={post.id} />}
    </article>
  );
}
