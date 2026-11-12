"use client";

import {
  COMMENT_MESSAGES,
  COMMENT_STATUS_LABELS,
  COMMENT_STATUSES,
  type CommentItem,
  formatDate,
  formatRelativeTime,
} from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { Badge } from "@xom-nho/ui/components/badge";
import { Button } from "@xom-nho/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@xom-nho/ui/components/dialog";
import { FieldError } from "@xom-nho/ui/components/field-error";
import { cn } from "@xom-nho/ui/lib/utils";
import { Pencil, Reply, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { initials } from "@/lib/initials";
import { userAvatarSrc } from "@/lib/media-url";
import { commentErrorText } from "../lib/error-text";
import { CommentForm } from "./comment-form";

/**
 * Một bình luận (MASTER mục 7, thread view): avatar 32, tên, thời gian, "đã sửa", nội dung chữ thường giữ
 * xuống dòng. Người viết sửa tại chỗ, xóa có hỏi lại. Bình luận đã ẩn (chỉ trưởng xóm nhận được) hiện mờ
 * kèm nhãn "Đã ẩn". Quyền thật do backend quyết; nút chỉ hiện cho tiện.
 */
export function CommentView({
  comment,
  viewerId,
  now,
  replyCount = 0,
  canReply,
  onReply,
  onUpdated,
  onDeleted,
}: {
  comment: CommentItem;
  viewerId: string;
  now: Date;
  /** Số trả lời bên dưới (bình luận gốc), để báo khi xóa */
  replyCount?: number;
  canReply: boolean;
  onReply: (comment: CommentItem) => void;
  onUpdated: (comment: CommentItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hidden = comment.status === COMMENT_STATUSES.HIDDEN;
  const own = comment.author.id === viewerId && !hidden;
  const profileHref = comment.author.username ? `/u/${comment.author.username}` : null;

  async function save(content: string): Promise<string | null> {
    try {
      const { data } = await browserApi.comments.update(comment.id, { content });
      onUpdated(data);
      setEditing(false);
      return null;
    } catch (caught) {
      return commentErrorText(caught);
    }
  }

  async function remove() {
    setDeleting(true);
    setError(null);
    try {
      await browserApi.comments.remove(comment.id);
      setConfirmOpen(false);
      onDeleted(comment.id);
    } catch (caught) {
      setConfirmOpen(false);
      setError(commentErrorText(caught));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article
      aria-label={`Bình luận của ${comment.author.name}`}
      className={cn("flex gap-3", hidden && "opacity-60")}
    >
      <Avatar className="mt-0.5">
        <AvatarImage src={userAvatarSrc(comment.author) ?? undefined} alt="" />
        <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          {profileHref ? (
            <Link
              href={profileHref}
              className="text-base font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {comment.author.name}
            </Link>
          ) : (
            <span className="text-base font-semibold text-foreground">{comment.author.name}</span>
          )}
          <time
            dateTime={comment.createdAt}
            title={formatDate(comment.createdAt)}
            className="text-muted-foreground"
          >
            {formatRelativeTime(comment.createdAt, now)}
          </time>
          {comment.editedAt && (
            <span className="text-muted-foreground">
              <span aria-hidden="true">· </span>
              {COMMENT_MESSAGES.EDITED}
            </span>
          )}
          {hidden && (
            <Badge variant="outline" className="h-6">
              {COMMENT_STATUS_LABELS.HIDDEN}
            </Badge>
          )}
        </header>

        {editing ? (
          <CommentForm
            id={`edit-${comment.id}`}
            label="Sửa bình luận"
            submitLabel="Lưu"
            initialValue={comment.content}
            focusOnMount
            onSubmit={save}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <p className="text-base wrap-break-word whitespace-pre-line text-card-foreground">
            {comment.content}
          </p>
        )}

        <FieldError role="alert">{error}</FieldError>

        {!editing && (canReply || own) && (
          <div className="-ml-2 flex flex-wrap items-center gap-x-1">
            {canReply && !hidden && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-2"
                onClick={() => onReply(comment)}
              >
                <Reply aria-hidden="true" className="max-sm:hidden" />
                Trả lời
              </Button>
            )}
            {own && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  onClick={() => setEditing(true)}
                >
                  <Pencil aria-hidden="true" className="max-sm:hidden" />
                  Sửa
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 aria-hidden="true" className="max-sm:hidden" />
                  Xóa
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !deleting && setConfirmOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{COMMENT_MESSAGES.DELETE_TITLE}</DialogTitle>
            <DialogDescription>
              {replyCount > 0
                ? COMMENT_MESSAGES.DELETE_WITH_REPLIES
                : COMMENT_MESSAGES.DELETE_DESCRIPTION}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={deleting}
              onClick={() => setConfirmOpen(false)}
            >
              Giữ lại
            </Button>
            <Button type="button" variant="destructive" loading={deleting} onClick={remove}>
              Xóa bình luận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
