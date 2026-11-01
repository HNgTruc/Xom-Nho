---
description: Review các thay đổi trên nhánh hiện tại so với main
argument-hint: "[nhánh gốc, mặc định main]"
---

# Review thay đổi

Nhánh gốc: `$ARGUMENTS` (trống thì dùng `main`).

1. `git diff <nhánh gốc>...HEAD --stat` rồi `git diff <nhánh gốc>...HEAD`. Có thay đổi chưa commit thì xem thêm `git diff`.
2. Xác định phần bị đổi (backend, web, admin, mobile-app, ui, shared), đọc `CLAUDE.md` của phần đó và rule trong `.claude/rules/` áp dụng.
3. Kiểm tra:
   - **Chức năng**: khớp tiêu chí trong `docs/tinh-nang.md`? Ca biên?
   - **Bảo mật**: endpoint mới có guard, `@Roles` (admin), policy, Zod pipe, giới hạn tần suất?
   - **Ranh giới**: frontend không import lẫn nhau; gọi API qua `shared/api-client`; component nền ở `ui`; mobile không dùng component web.
   - **Tầng backend**: controller mỏng, quy tắc ở service, truy vấn ở repository.
   - **Hợp đồng API**: đổi endpoint có cập nhật `docs/api.md`, `shared/types`, `shared/api-client`?
   - **Kiểu**: `any`, `as`, `!` không cần thiết?
   - **Giao diện**: chữ tiếng Việt đúng giọng văn; đủ trạng thái tải/lỗi/trống; nhãn tiếp cận.
   - **Hiệu năng**: N+1, lấy thừa cột, client component không cần thiết.
   - **Tài liệu, test**: đã cập nhật `docs/`? có test cho logic mới?
4. Chạy `pnpm lint`, `pnpm typecheck`, `pnpm test` (bỏ qua script chưa có) và ghi kết quả.

## Kết quả

Nhóm theo mức độ, mỗi mục `file:dòng`, vấn đề, cách sửa:

- 🔴 **Phải sửa**: lỗi, lỗ hổng bảo mật, sai nghiệp vụ, phá ranh giới
- 🟡 **Nên sửa**: khó bảo trì, thiếu test, lệch quy ước
- 🔵 **Gợi ý**: cải thiện nhỏ

Kết luận một câu: nên merge chưa. Không tự sửa code trừ khi được yêu cầu.
