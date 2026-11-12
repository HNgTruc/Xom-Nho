"use client";

import {
  COMMENT_MESSAGES,
  type CommentItem,
  type CommentThread,
  commentReplyLabel,
} from "@xom-nho/api";
import { Avatar, AvatarFallback, AvatarImage } from "@xom-nho/ui/components/avatar";
import { useMemo, useState } from "react";
import { browserApi } from "@/lib/browser-api";
import { initials } from "@/lib/initials";
import { commentErrorText } from "../lib/error-text";
import {
  addComment,
  countComments,
  mentionPrefix,
  removeComment,
  replaceComment,
} from "../lib/threads";
import { CommentForm } from "./comment-form";
import { CommentView } from "./comment-view";

export interface CommentViewer {
  id: string;
  name: string;
  avatarSrc: string | null;
}

/**
 * Khối bình luận dưới bài (docs/tinh-nang.md mục 3): ô viết bình luận, các nhánh bình luận gốc, trả lời thụt
 * vào một cấp có đường dọc bên trái (MASTER mục 7). Gửi, sửa, xóa xong thì cập nhật tại chỗ, không tải lại
 * trang. Trả lời một trả lời thì ô trả lời nằm cuối nhánh, điền sẵn "@tên".
 */
export function CommentThreads({
  postId,
  initialThreads,
  viewer,
  now,
  canComment,
}: {
  postId: string;
  initialThreads: CommentThread[];
  viewer: CommentViewer;
  /** Mốc tính "5 phút trước", lấy từ server để server và trình duyệt ra cùng chữ */
  now: string;
  /** Bài đã đăng thì nhận bình luận; bài đang ẩn (chủ bài xem) thì chỉ đọc */
  canComment: boolean;
}) {
  const [threads, setThreads] = useState(initialThreads);
  const [replyTo, setReplyTo] = useState<{ threadId: string; target: CommentItem } | null>(null);
  const nowDate = useMemo(() => new Date(now), [now]);
  const total = countComments(threads);

  async function send(content: string, parentId?: string): Promise<string | null> {
    try {
      const { data } = await browserApi.comments.create(postId, { content, parentId });
      setThreads((current) => addComment(current, data));
      return null;
    } catch (error) {
      return commentErrorText(error);
    }
  }

  async function sendReply(content: string): Promise<string | null> {
    if (!replyTo) return null;
    const problem = await send(content, replyTo.target.id);
    if (!problem) setReplyTo(null);
    return problem;
  }

  const viewProps = {
    viewerId: viewer.id,
    now: nowDate,
    canReply: canComment,
    onUpdated: (item: CommentItem) => setThreads((current) => replaceComment(current, item)),
    onDeleted: (id: string) => {
      setThreads((current) => removeComment(current, id));
      setReplyTo((current) =>
        current && (current.threadId === id || current.target.id === id) ? null : current,
      );
    },
  };

  return (
    <section
      aria-labelledby="comments-heading"
      className="flex flex-col gap-6 border-t border-border pt-6"
    >
      <h2 id="comments-heading" className="text-xl font-semibold">
        {COMMENT_MESSAGES.HEADING}
        {total > 0 && <span className="ml-2 font-normal text-muted-foreground">{total}</span>}
      </h2>

      {canComment ? (
        <div className="flex gap-3">
          <Avatar className="mt-7 hidden sm:flex">
            <AvatarImage src={viewer.avatarSrc ?? undefined} alt="" />
            <AvatarFallback>{initials(viewer.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CommentForm
              id="comment-new"
              label={COMMENT_MESSAGES.FORM_LABEL}
              submitLabel={COMMENT_MESSAGES.SUBMIT}
              onSubmit={(content) => send(content)}
            />
          </div>
        </div>
      ) : (
        <p className="rounded-md bg-muted px-4 py-3 text-base text-muted-foreground">
          {COMMENT_MESSAGES.POST_CLOSED}
        </p>
      )}

      {threads.length === 0 ? (
        <p className="text-base text-muted-foreground">{COMMENT_MESSAGES.NONE_YET}</p>
      ) : (
        <ol className="flex flex-col gap-6">
          {threads.map((thread) => {
            const replyingHere = replyTo?.threadId === thread.id;
            return (
              <li key={thread.id} className="flex flex-col gap-4">
                <CommentView
                  comment={thread}
                  replyCount={thread.replies.length}
                  onReply={(target) => setReplyTo({ threadId: thread.id, target })}
                  {...viewProps}
                />

                {(thread.replies.length > 0 || replyingHere) && (
                  // Trả lời thụt 40px (16 + 24) với đường dọc bên trái, chỉ một cấp; màn hẹp 28px cho đủ chỗ
                  <div className="ml-3 flex flex-col gap-4 border-l-2 border-border pl-4 sm:ml-4 sm:pl-6">
                    {thread.replies.length > 0 && (
                      <ol className="flex flex-col gap-4">
                        {thread.replies.map((reply) => (
                          <li key={reply.id}>
                            <CommentView
                              comment={reply}
                              onReply={(target) => setReplyTo({ threadId: thread.id, target })}
                              {...viewProps}
                            />
                          </li>
                        ))}
                      </ol>
                    )}

                    {replyingHere && replyTo && (
                      <CommentForm
                        // Đổi người được trả lời thì dựng lại ô (chữ điền sẵn mới)
                        key={replyTo.target.id}
                        id={`reply-${thread.id}`}
                        label={commentReplyLabel(replyTo.target.author.name)}
                        submitLabel={COMMENT_MESSAGES.REPLY_SUBMIT}
                        initialValue={mentionPrefix(replyTo.target, viewer.id)}
                        focusOnMount
                        onSubmit={sendReply}
                        onCancel={() => setReplyTo(null)}
                      />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
