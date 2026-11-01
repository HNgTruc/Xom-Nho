# API (`backend`, `/api/v1`)

Backend NestJS là nguồn dữ liệu duy nhất cho cả ba frontend. Frontend gọi qua `@xom-nho/shared/api-client`, không tự viết `fetch`.

- `/api/auth/*`: Better Auth (đăng ký, đăng nhập, OAuth, phiên)
- `/api/v1/*`: dùng cho web và mobile-app
- `/api/v1/admin/*`: chỉ dùng cho admin, mọi route yêu cầu vai trò `admin`

## Quy ước chung

**Đăng nhập.** Mặc định mọi route cần đăng nhập. Ký hiệu: 🌐 công khai (`@Public()`), 🔒 cần đăng nhập, 🛡️ cần `admin`.

**Định dạng phản hồi.**

```jsonc
// Thành công
{ "data": { ... } }

// Thành công, có phân trang
{ "data": [ ... ], "meta": { "page": 1, "pageSize": 10, "total": 57, "totalPages": 6 } }

// Lỗi
{ "error": { "code": "VALIDATION_ERROR", "message": "Tiêu đề quá ngắn", "fields": { "title": "Tối thiểu 5 ký tự" } } }
```

Interceptor (`common/interceptors/response.interceptor.ts`) bọc `data`/`meta`; exception filter (`common/filters/`) tạo khối `error`. Controller chỉ trả dữ liệu hoặc ném `AppException`.

**Mã lỗi** (khai báo ở `shared/src/constants/error-codes.ts`):

| code               | HTTP | Khi nào                                   |
| ------------------ | ---- | ----------------------------------------- |
| `VALIDATION_ERROR` | 400  | Dữ liệu không qua schema Zod              |
| `UNAUTHORIZED`     | 401  | Chưa đăng nhập                            |
| `FORBIDDEN`        | 403  | Không đủ quyền, hoặc bị cấm               |
| `NOT_FOUND`        | 404  | Không có hoặc không được xem              |
| `CONFLICT`         | 409  | Trùng (slug, tên tag...)                  |
| `RATE_LIMITED`     | 429  | Gửi quá nhanh                             |
| `INTERNAL_ERROR`   | 500  | Lỗi không lường trước (không lộ chi tiết) |

**Kiểu dữ liệu**: mọi phản hồi khai báo trong `shared/src/types/`. Mọi body nhận vào có schema trong `shared/src/schemas/`.

**Phân trang**: `?page=1&pageSize=10`; `pageSize` tối đa 50 (admin tối đa 100).

**Phiên bản**: đổi định dạng theo kiểu phá vỡ frontend cũ (nhất là app đã cài trên điện thoại) thì tạo `/api/v2`, không sửa `/api/v1` đang chạy.

## Dành cho web và mobile-app

### Bài viết (`modules/posts`)

| Method | Đường dẫn                                   |     | Mô tả                                                            |
| ------ | ------------------------------------------- | --- | ---------------------------------------------------------------- |
| GET    | `/posts?page=&category=&tag=&sort=new\|top` | 🌐  | Danh sách bài đã đăng                                            |
| GET    | `/posts/:slug`                              | 🌐  | Chi tiết bài (Markdown thô). Bài chưa đăng: chỉ tác giả xem được |
| POST   | `/posts/:id/view`                           | 🌐  | Tăng lượt xem                                                    |
| POST   | `/posts`                                    | 🔒  | Tạo bài. Body: `createPostSchema`                                |
| PATCH  | `/posts/:id`                                | 🔒  | Sửa bài của mình. Body: `updatePostSchema`                       |
| DELETE | `/posts/:id`                                | 🔒  | Xóa bài của mình                                                 |
| GET    | `/me/posts?status=`                         | 🔒  | Bài của tôi, mọi trạng thái                                      |

`PostListItem`: `id, title, slug, excerpt, publishedAt, viewCount, commentCount, author { name, username, image }, category { name, slug }, tags [{ name, slug }]`.
`PostDetail`: `PostListItem` + `content, status, rejectReason?, updatedAt`.

### Tìm kiếm (`modules/search`)

| Method | Đường dẫn                    |     | Mô tả                                                       |
| ------ | ---------------------------- | --- | ----------------------------------------------------------- |
| GET    | `/search?q=&category=&page=` | 🌐  | Tìm theo tiêu đề, tóm tắt, tag; có dấu / không dấu đều được |

### Bình luận (`modules/comments`)

| Method | Đường dẫn             |     | Mô tả                                            |
| ------ | --------------------- | --- | ------------------------------------------------ |
| GET    | `/posts/:id/comments` | 🌐  | Bình luận gốc đang hiện, mỗi cái kèm `replies[]` |
| POST   | `/posts/:id/comments` | 🔒  | Body: `{ content, parentId? }`                   |
| PATCH  | `/comments/:id`       | 🔒  | Sửa bình luận của mình                           |
| DELETE | `/comments/:id`       | 🔒  | Xóa bình luận của mình                           |

### Danh mục, tag, người dùng

| Method | Đường dẫn          |     | Mô tả                             |
| ------ | ------------------ | --- | --------------------------------- |
| GET    | `/categories`      | 🌐  | Tất cả danh mục, kèm số bài       |
| GET    | `/tags?q=`         | 🌐  | Gợi ý tag khi gõ (tối đa 10)      |
| GET    | `/users/:username` | 🌐  | Hồ sơ công khai + bài đã đăng     |
| GET    | `/me`              | 🔒  | Thông tin của tôi (gồm `role`)    |
| PATCH  | `/me`              | 🔒  | Sửa tên, giới thiệu, ảnh đại diện |

### Hệ thống

| Method | Đường dẫn |     | Mô tả                                |
| ------ | --------- | --- | ------------------------------------ |
| GET    | `/health` | 🌐  | Kiểm tra backend và kết nối database |

## Dành cho admin (`/api/v1/admin`, tất cả 🛡️)

Mỗi module có file `*.admin.controller.ts` riêng, dùng chung service với controller công khai.

### Tổng quan (`modules/dashboard`)

| Method | Đường dẫn          | Mô tả                                                                        |
| ------ | ------------------ | ---------------------------------------------------------------------------- |
| GET    | `/admin/dashboard` | Số bài chờ duyệt, bài/bình luận/thành viên mới trong 7 ngày, biểu đồ 30 ngày |

### Bài viết

| Method | Đường dẫn                                               | Mô tả                                  |
| ------ | ------------------------------------------------------- | -------------------------------------- |
| GET    | `/admin/posts?status=&category=&author=&q=&page=&sort=` | Mọi bài, mọi trạng thái                |
| GET    | `/admin/posts/:id`                                      | Chi tiết, kể cả bài nháp               |
| POST   | `/admin/posts/:id/approve`                              | Duyệt: `PENDING` → `PUBLISHED`         |
| POST   | `/admin/posts/:id/reject`                               | Từ chối. Body: `{ reason }` (bắt buộc) |
| POST   | `/admin/posts/:id/archive`                              | Ẩn bài                                 |
| POST   | `/admin/posts/:id/restore`                              | Khôi phục                              |
| PATCH  | `/admin/posts/:id`                                      | Sửa bài bất kỳ                         |
| DELETE | `/admin/posts/:id`                                      | Xóa bài bất kỳ                         |

### Bình luận

| Method | Đường dẫn                                        | Mô tả         |
| ------ | ------------------------------------------------ | ------------- |
| GET    | `/admin/comments?status=&post=&author=&q=&page=` | Mọi bình luận |
| POST   | `/admin/comments/:id/hide`                       | Ẩn            |
| POST   | `/admin/comments/:id/show`                       | Hiện lại      |
| DELETE | `/admin/comments/:id`                            | Xóa           |

### Danh mục, tag

| Method | Đường dẫn                 | Mô tả                                  |
| ------ | ------------------------- | -------------------------------------- |
| POST   | `/admin/categories`       | Thêm                                   |
| PATCH  | `/admin/categories/:id`   | Sửa                                    |
| PUT    | `/admin/categories/order` | Sắp xếp lại. Body: `{ ids: string[] }` |
| DELETE | `/admin/categories/:id`   | Xóa (chỉ khi không còn bài)            |
| GET    | `/admin/tags?q=&page=`    | Danh sách kèm số bài                   |
| POST   | `/admin/tags/:id/merge`   | Gộp vào tag khác. Body: `{ targetId }` |
| DELETE | `/admin/tags/:id`         | Xóa                                    |

### Thành viên

| Method | Đường dẫn                             | Mô tả                                                 |
| ------ | ------------------------------------- | ----------------------------------------------------- |
| GET    | `/admin/users?role=&banned=&q=&page=` | Danh sách, tìm theo tên/email                         |
| GET    | `/admin/users/:id`                    | Chi tiết + số bài, bình luận                          |
| PATCH  | `/admin/users/:id/role`               | Body: `{ role }`. Không tự đổi vai trò của chính mình |
| POST   | `/admin/users/:id/ban`                | Body: `{ reason, expiresAt? }`. Không tự cấm mình     |
| POST   | `/admin/users/:id/unban`              | Bỏ cấm                                                |

Phần đổi vai trò và cấm có thể dùng API của plugin admin trong Better Auth; nếu vậy, endpoint ở đây là lớp mỏng gọi qua để giữ cùng định dạng phản hồi.

## Giới hạn tần suất

- Đăng nhập/đăng ký: giới hạn sẵn của Better Auth.
- Tạo bài: tối đa 5 bài/giờ với `user`.
- Bình luận: tối đa 1 bình luận / 10 giây / người.

Giai đoạn đầu lưu bộ đếm trong bộ nhớ (`infrastructure/rate-limit`); khi chạy nhiều instance thì chuyển sang MySQL hoặc Redis.
