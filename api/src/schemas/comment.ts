import { z } from "zod";
import { LIMITS } from "../constants/limits.js";
import { COMMENT_MESSAGES } from "../constants/messages.js";
import { pathIdSchema } from "./common.js";

/** Nội dung bình luận: chữ thường (không Markdown, không HTML), cắt khoảng trắng hai đầu, giữ xuống dòng. */
const commentContent = z
  .string({ error: COMMENT_MESSAGES.EMPTY })
  .trim()
  .min(1, COMMENT_MESSAGES.EMPTY)
  .max(LIMITS.COMMENT_MAX, COMMENT_MESSAGES.TOO_LONG);

/**
 * Body của `POST /posts/:id/comments`. `parentId`: bình luận đang trả lời (gốc hay trả lời đều được; backend
 * luôn gắn vào bình luận gốc của nhánh, nên chỉ có một cấp). Không gửi là bình luận gốc.
 */
export const createCommentSchema = z.object({
  content: commentContent,
  parentId: pathIdSchema.optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

/** Body của `PATCH /comments/:id`: chỉ sửa nội dung. */
export const updateCommentSchema = z.object({
  content: commentContent,
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
