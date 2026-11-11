---
description: Đọc và sửa một issue trên GitHub
argument-hint: "<số issue>"
---

# Sửa issue #$ARGUMENTS

1. Đọc issue: `gh issue view $ARGUMENTS --json title,body,labels,comments`.
2. Tóm tắt lại vấn đề bằng 1 đến 2 câu. Không rõ thì hỏi trước khi làm.
3. Tìm code liên quan (Grep/Glob), đọc rule và tài liệu áp dụng.
4. Nếu là lỗi: viết test tái hiện, chạy thấy đỏ.
5. Sửa ở đúng tầng (thường là service). Nếu ảnh hưởng cả web và app, sửa cả hai.
6. Chạy test, lint, typecheck liên quan.
7. Tóm tắt: nguyên nhân, cách sửa, file đã đổi, cách kiểm tra lại bằng tay.
8. Đề xuất commit message dạng `fix: <mô tả> (closes #$ARGUMENTS)` để chủ dự án tự commit. Không tự commit.
