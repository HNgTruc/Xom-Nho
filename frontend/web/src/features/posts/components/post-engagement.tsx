"use client";

import {
  COMMENT_MESSAGES,
  commentCountLabel,
  LIKE_MESSAGES,
  likeCountLabel,
  type PostLikeState,
  SHARE_MESSAGES,
} from "@xom-nho/api";
import { Button } from "@xom-nho/ui/components/button";
import { cn } from "@xom-nho/ui/lib/utils";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { likeErrorText, toggledLike } from "../lib/like-state";

const numberFormat = new Intl.NumberFormat("vi-VN");

type Notice = { tone: "info" | "error"; text: string };

/** Nút nằm trên lớp liên kết phủ kín thẻ bài (`PostCard`) để bấm riêng được. */
const aboveCardLink = "relative z-10";

/** Nút trong hàng hành động: chia đều ba cột; điện thoại cao 44px cho đủ vùng bấm (MASTER mục 10). */
const actionButton = "w-full px-2 max-sm:h-11";

/**
 * Số thích, số bình luận và hàng nút Thích, Bình luận, Chia sẻ (docs/tinh-nang.md mục 2.1, 2.6; MASTER mục 7).
 * Dùng ở thẻ bài trong feed và trang bài.
 * - Thích: đổi ngay khi bấm (cập nhật lạc quan), gửi `PUT`/`DELETE` theo trạng thái muốn có. Bấm liên tục thì chỉ
 *   kết quả của lần bấm cuối được hiện; lỗi thì trả về trạng thái backend xác nhận gần nhất và báo lỗi.
 * - Chia sẻ: màn hình cảm ứng có `navigator.share` thì mở bảng chia sẻ của hệ điều hành; còn lại sao chép liên kết.
 * - Bình luận: liên kết tới khối bình luận của trang bài (`#binh-luan`).
 */
export function PostEngagement({
  postId,
  slug,
  shareTitle,
  like,
  commentCount,
  commentsHref,
  showCommentCount = true,
  className,
}: {
  postId: string;
  slug: string;
  /** Tiêu đề gửi kèm bảng chia sẻ của hệ điều hành */
  shareTitle: string;
  like: PostLikeState;
  commentCount: number;
  commentsHref: string;
  /** Trang bài tự đếm bình luận ở khối bình luận nên không hiện số ở đây (số sẽ cũ khi gửi bình luận mới) */
  showCommentCount?: boolean;
  className?: string;
}) {
  const [state, setState] = useState(like);
  // Trang tải lại dữ liệu (`router.refresh()`) thì lấy số mới của server
  const [serverLike, setServerLike] = useState(like);
  if (serverLike.liked !== like.liked || serverLike.likeCount !== like.likeCount) {
    setServerLike(like);
    setState(like);
  }
  const confirmed = useRef(like);
  const latestRequest = useRef(0);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    confirmed.current = serverLike;
  }, [serverLike]);

  // Lời báo (đã sao chép, lỗi) tự ẩn sau 5 giây
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function toggleLike() {
    const next = toggledLike(state);
    setState(next);
    setNotice(null);
    const request = ++latestRequest.current;
    try {
      const { data } = next.liked
        ? await browserApi.posts.like(postId)
        : await browserApi.posts.unlike(postId);
      confirmed.current = data;
      if (request === latestRequest.current) setState(data);
    } catch (error) {
      if (request !== latestRequest.current) return;
      setState(confirmed.current);
      setNotice({ tone: "error", text: likeErrorText(error) });
    }
  }

  async function share() {
    const url = new URL(`/bai-viet/${slug}`, window.location.origin).toString();
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: shareTitle, url });
        return;
      } catch (error) {
        // Người dùng đóng bảng chia sẻ: không báo gì. Lỗi khác thì sao chép liên kết thay
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNotice({ tone: "info", text: SHARE_MESSAGES.COPIED });
    } catch {
      setNotice({ tone: "error", text: SHARE_MESSAGES.COPY_FAILED });
    }
  }

  const showLikes = state.likeCount > 0;
  const showComments = showCommentCount && commentCount > 0;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(showLikes || showComments) && (
        <div className="flex min-h-6 items-center justify-between gap-2 text-sm text-muted-foreground">
          {showLikes ? (
            <span className="inline-flex items-center gap-1">
              <Heart aria-hidden="true" className="size-4 fill-current" strokeWidth={1.75} />
              <span aria-hidden="true">{numberFormat.format(state.likeCount)}</span>
              <span className="sr-only">{likeCountLabel(state.likeCount)}</span>
            </span>
          ) : (
            <span />
          )}
          {showComments && (
            <Link
              href={commentsHref}
              className={cn(
                aboveCardLink,
                "rounded-sm hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              )}
            >
              {commentCountLabel(commentCount)}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 border-t border-border pt-2">
        <Button
          type="button"
          variant="ghost"
          aria-pressed={state.liked}
          onClick={() => void toggleLike()}
          className={cn(aboveCardLink, actionButton, state.liked && "font-semibold")}
        >
          <Heart
            aria-hidden="true"
            className={cn(
              "size-5 transition-transform ease-standard group-active/button:scale-90 motion-reduce:transition-none",
              state.liked && "fill-current",
            )}
          />
          {LIKE_MESSAGES.LIKE}
        </Button>
        <Button asChild variant="ghost" className={cn(aboveCardLink, actionButton)}>
          <Link href={commentsHref}>
            <MessageCircle aria-hidden="true" className="size-5" />
            {COMMENT_MESSAGES.HEADING}
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => void share()}
          className={cn(aboveCardLink, actionButton)}
        >
          <Share2 aria-hidden="true" className="size-5" />
          {SHARE_MESSAGES.SHARE}
        </Button>
      </div>

      <output
        aria-live="polite"
        className={cn(
          "text-sm font-medium empty:hidden",
          notice?.tone === "error" ? "text-destructive" : "text-foreground",
        )}
      >
        {notice?.text}
      </output>
    </div>
  );
}
