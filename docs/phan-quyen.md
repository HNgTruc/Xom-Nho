# Phân quyền

## Vai trò

| Mã (trong code) | Tên hiển thị   | Ai                                                   |
| --------------- | -------------- | ---------------------------------------------------- |
| (khách)         | Khách ghé chơi | Chưa đăng nhập: chỉ thấy trang chào mừng (ADR 0007)  |
| `user`          | Hàng xóm       | Mặc định khi đăng ký                                 |
| `author`        | Cây bút        | Hàng xóm được admin nâng quyền vì viết tốt, đáng tin |
| `admin`         | Trưởng xóm     | Quản trị                                             |

Vai trò lưu ở cột `role` của bảng `user` (plugin admin của Better Auth). Người bị cấm (`banned = true`) không đăng nhập được; phiên cũ còn lại thì mọi route cần đăng nhập trả 403, kể cả route đọc.

## Ma trận quyền

| Hành động                               | Khách | Hàng xóm | Cây bút | Trưởng xóm |
| --------------------------------------- | :---: | :------: | :-----: | :--------: |
| Xem trang chào mừng, đăng ký, đăng nhập |  ✅   |          |         |            |
| Xem bài đã đăng, bình luận đang hiện    |       |    ✅    |   ✅    |     ✅     |
| Tìm kiếm, lọc theo danh mục/tag         |       |    ✅    |   ✅    |     ✅     |
| Xem hồ sơ hàng xóm                      |       |    ✅    |   ✅    |     ✅     |
| Bình luận, trả lời bình luận            |       |    ✅    |   ✅    |     ✅     |
| Sửa/xóa bình luận của mình              |       |    ✅    |   ✅    |     ✅     |
| Viết bài, kèm ảnh/video (đăng thẳng)    |       |    ✅    |   ✅    |     ✅     |
| Tải ảnh, video lên                      |       |    ✅    |   ✅    |     ✅     |
| Xem ảnh, video của bài đã đăng          |       |    ✅    |   ✅    |     ✅     |
| Đổi, xóa ảnh đại diện của mình          |       |    ✅    |   ✅    |     ✅     |
| Xem ảnh đại diện của người khác         |       |    ✅    |   ✅    |     ✅     |
| Sửa bài của mình                        |       |    ✅    |   ✅    |     ✅     |
| Xóa bài của mình                        |       |    ✅    |   ✅    |     ✅     |
| Tạo tag mới khi viết bài                |       |          |   ✅    |     ✅     |
| Duyệt / từ chối bài                     |       |          |         |     ✅     |
| Ẩn / hiện bình luận bất kỳ              |       |          |         |     ✅     |
| Sửa / xóa bài bất kỳ                    |       |          |         |     ✅     |
| Quản lý danh mục, tag                   |       |          |         |     ✅     |
| Đổi vai trò, cấm người dùng             |       |          |         |     ✅     |
| Đăng nhập app admin                     |       |          |         |     ✅     |

Hàng xóm chỉ được gắn tag đã có; cây bút và trưởng xóm được tạo tag mới.

Khách không đọc được gì (ADR 0007): backend trả 401 cho mọi route đọc dữ liệu, chỉ mở `GET /health` và `GET /auth/providers`. Web hiện trang chào mừng ở `/` và chuyển các trang khác sang đăng nhập (`frontend/web/src/proxy.ts`).

## Trạng thái bài viết

Từ ADR 0008 mọi thành viên đăng thẳng: bài soạn ở trang chủ vào thẳng `PUBLISHED`. Các trạng thái chờ duyệt bên dưới giữ cho bài cũ và trình soạn Markdown sau này (nếu bật lại duyệt bài).

Bài viết, sửa và xóa (`posts.policy.ts`, `canModify`): qua route thường chỉ tác giả, ở mọi trạng thái (kể cả bài bị ẩn); bài đã đăng của người khác trả 403, bài ẩn của người khác trả 404. Trưởng xóm sửa, xóa bài bất kỳ bằng route admin (giai đoạn 5).

Bình luận (`comments.policy.ts`): bình luận đã ẩn chỉ trưởng xóm thấy (người viết cũng không); sửa, xóa chỉ người viết và khi bình luận còn hiện; bài chứa bình luận phải xem được (bài đã ẩn chỉ chủ bài, trưởng xóm mở, và không nhận bình luận mới).

Ảnh, video (`GET /files/:id`): ảnh đại diện và file trong bài đã đăng thì mọi thành viên xem; file chưa gắn bài hoặc thuộc bài chưa đăng chỉ người tải lên và trưởng xóm xem (`files.policy.ts`).

```mermaid
stateDiagram-v2
  [*] --> PUBLISHED: đăng từ ô tạo bài (mọi thành viên, ADR 0008)
  [*] --> DRAFT: lưu nháp
  DRAFT --> PENDING: hàng xóm gửi
  DRAFT --> PUBLISHED: cây bút / trưởng xóm đăng
  PENDING --> PUBLISHED: trưởng xóm duyệt
  PENDING --> REJECTED: trưởng xóm từ chối (kèm lý do)
  REJECTED --> PENDING: tác giả sửa và gửi lại
  PUBLISHED --> PENDING: hàng xóm sửa bài đã đăng
  PUBLISHED --> ARCHIVED: tác giả / trưởng xóm ẩn
  ARCHIVED --> PUBLISHED: khôi phục
```

Chỉ bài `PUBLISHED` hiện cho người khác. Tác giả luôn xem được bài của mình ở mọi trạng thái.

## Cách kiểm tra quyền trong code

Mọi kiểm tra nằm ở `backend`, chia ba lớp:

| Lớp                              | Ở đâu                                                   | Kiểm tra gì                                                                              |
| -------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `AuthGuard` (toàn cục)           | `backend/src/common/guards/auth.guard.ts`               | Có phiên chưa (trừ route `@Public()`: chỉ `/health`, `/auth/providers`), có bị cấm không |
| `RolesGuard` + `@Roles("admin")` | `backend/src/common/guards/roles.guard.ts`              | Vai trò, gắn ở cấp class cho mọi `*.admin.controller.ts`                                 |
| Policy                           | `backend/src/modules/<tính-năng>/<tính-năng>.policy.ts` | Quyền trên **một bản ghi cụ thể**, service gọi trước khi ghi                             |

```ts
// Ví dụ chữ ký hàm trong posts.policy.ts, chưa phải code thật
canView(user: SessionUser | null, post: Post): boolean        // bài đã đăng, hoặc chủ bài, hoặc admin
canEdit(user: SessionUser, post: Post): boolean               // chủ bài hoặc admin
canPublishDirectly(user: SessionUser): boolean                // author hoặc admin
canCreateTag(user: SessionUser): boolean                      // author hoặc admin
```

Quy tắc: **frontend không quyết định quyền**. Web, admin, mobile chỉ dựa vào `role` để ẩn/hiện nút cho tiện; backend luôn kiểm tra lại. App admin chặn người không phải admin ngay khi đăng nhập, nhưng chỗ chặn thật là `RolesGuard`.
