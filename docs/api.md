# API (`backend`, `/api/v1`)

Backend NestJS là nguồn dữ liệu duy nhất cho cả ba frontend. Frontend gọi qua `@xom-nho/api/api-client`, không tự viết `fetch`.

- `/api/auth/*`: Better Auth (đăng ký, đăng nhập, OAuth, phiên)
- `/api/v1/*`: dùng cho web và mobile-app
- `/api/v1/admin/*`: chỉ dùng cho admin, mọi route yêu cầu vai trò `admin`

## Quy ước chung

**Đăng nhập.** Mặc định mọi route cần đăng nhập, **kể cả route đọc** (ADR 0007: khách chỉ thấy trang chào mừng). Ký hiệu: 🌐 công khai (`@Public()`), 🔒 cần đăng nhập, 🛡️ cần `admin`. Khách gọi route 🔒 nhận 401, người bị cấm nhận 403.

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

**Mã lỗi** (khai báo ở `api/src/constants/error-codes.ts`):

| code               | HTTP | Khi nào                                   |
| ------------------ | ---- | ----------------------------------------- |
| `VALIDATION_ERROR` | 400  | Dữ liệu không qua schema Zod              |
| `UNAUTHORIZED`     | 401  | Chưa đăng nhập                            |
| `FORBIDDEN`        | 403  | Không đủ quyền, hoặc bị cấm               |
| `NOT_FOUND`        | 404  | Không có hoặc không được xem              |
| `CONFLICT`         | 409  | Trùng (slug, tên tag...)                  |
| `RATE_LIMITED`     | 429  | Gửi quá nhanh                             |
| `INTERNAL_ERROR`   | 500  | Lỗi không lường trước (không lộ chi tiết) |

**Kiểu dữ liệu**: mọi phản hồi khai báo trong `api/src/types/`. Mọi body nhận vào có schema trong `api/src/schemas/`.

**Phân trang**: `?page=1&pageSize=10`; `pageSize` tối đa 50 (admin tối đa 100).

**Phiên bản**: đổi định dạng theo kiểu phá vỡ frontend cũ (nhất là app đã cài trên điện thoại) thì tạo `/api/v2`, không sửa `/api/v1` đang chạy.

### Quy tắc thay đổi API v1

Kiểu trong `api` chỉ bảo vệ lúc build. App đã cài trên điện thoại vẫn chạy code cũ và có thể không được cập nhật trong nhiều tháng. Vì vậy mọi thay đổi trong `/api/v1` phải để client cũ chạy tiếp được.

**Được làm (không phá client cũ):**

- Thêm trường mới vào phản hồi.
- Thêm query hoặc trường body **tùy chọn**, có giá trị mặc định giữ nguyên hành vi cũ.
- Thêm endpoint mới.
- Thêm giá trị mới vào enum trả về (`sort`, `status`, `role`...), với điều kiện client đã xử lý giá trị lạ (xem bên dưới).
- Nới giới hạn kiểm tra dữ liệu vào (ví dụ tăng độ dài tối đa).

**Không được làm (phải tạo `/api/v2`):**

- Đổi tên, xóa, đổi kiểu một trường đã trả về (kể cả đổi `string` thành `string | null`).
- Đổi ý nghĩa một trường hoặc một query đang có.
- Biến query hoặc trường body tùy chọn thành bắt buộc, hoặc siết giới hạn kiểm tra.
- Đổi định dạng `{ data, meta }`, `{ error }`, hoặc mã lỗi của một tình huống đã có.
- Đổi đường dẫn, method, hoặc mã HTTP thành công (`200`, `204`) của endpoint đang có.

**Client phải chịu được thay đổi:**

- Bỏ qua trường không biết trong phản hồi.
- Gặp giá trị enum lạ thì có nhánh mặc định (hiện như giá trị trung tính, không crash). Trên mobile, đây là điều kiện để thêm giá trị enum mới.
- Không dựa vào thứ tự trường hay số phần tử cố định trong mảng.

**Khi cần bỏ một thứ cũ:** thêm cái mới bên cạnh, đánh dấu cái cũ là "sắp bỏ" (comment `@deprecated` trong `api`, ghi chú ở bảng endpoint), chờ bản app mới đủ phổ biến rồi mới xóa ở `/api/v2`.

**Ví dụ đã tính sẵn:** muốn chuyển app sang cuộn bằng con trỏ thì thêm `?cursor=` tùy chọn cạnh `page` (được làm). Đổi `page` thành `cursor` thì không được làm.

## Dành cho web và mobile-app

### Bài viết (`modules/posts`)

| Method | Đường dẫn                                           |     | Mô tả                                                                                                                                                                                                   |
| ------ | --------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/posts?page=&category=&tag=&author=&sort=new\|top` | 🔒  | Danh sách bài đã đăng. Query: `listPostsQuerySchema` (`author` là username)                                                                                                                             |
| GET    | `/posts/:slug`                                      | 🔒  | Chi tiết bài (Markdown thô hoặc chữ thường, xem `contentFormat`). Bài chưa đăng: chỉ tác giả và admin xem được, người khác nhận 404                                                                     |
| POST   | `/posts/:id/view`                                   | 🔒  | Tăng lượt xem. Trả 204. Frontend gọi một lần mỗi phiên cho mỗi bài                                                                                                                                      |
| POST   | `/posts`                                            | 🔒  | Đăng bài, vào thẳng `PUBLISHED` (ADR 0008). Body: `createPostSchema` (`title` tùy chọn, `content` chữ thường, `category` slug, `mediaIds` tối đa 10). Trả 201 + `PostDetail`. Giới hạn 10 bài / 10 phút |
| PATCH  | `/posts/:id`                                        | 🔒  | Sửa bài của mình. Body: `updatePostSchema`                                                                                                                                                              |
| DELETE | `/posts/:id`                                        | 🔒  | Xóa bài của mình                                                                                                                                                                                        |
| GET    | `/me/posts?status=`                                 | 🔒  | Bài của tôi, mọi trạng thái                                                                                                                                                                             |

`PostListItem`: `id, title, slug, excerpt, publishedAt, viewCount, commentCount, author { id, name, username, image }, category { name, slug, color }, tags [{ name, slug }], media [{ id, kind, mimeType }]`. `title` rỗng với bài không đặt tiêu đề (frontend hiện `excerpt`). `media` theo thứ tự trong bài. `commentCount` chỉ đếm bình luận đang hiện. `author.id` để frontend so với `Me.id`.
`PostDetail`: `PostListItem` + `content, contentFormat (MARKDOWN | PLAIN), status, rejectReason, updatedAt`. `PLAIN`: chữ thường giữ xuống dòng, không render Markdown. `rejectReason` là `null` trừ khi bài bị từ chối.

Đường dẫn khớp chính xác: `:slug` (bài, tag) và `:username` phải đúng dạng chuẩn (chữ thường, không khoảng trắng). Sai dạng, kể cả viết hoa (`/posts/Moi-Nhat`), trả 404 như không có, không phải 400: mỗi trang chỉ có một URL. `:id` sai dạng (quá 64 ký tự, có ký tự lạ) cũng trả 404. Bộ lọc trong query (`?category=`, `?tag=`, `?author=`) thì dễ dãi hơn: tự cắt khoảng trắng, đổi chữ thường.

Cache của `GET /posts/:slug`: mọi phản hồi (cả 404) có `Vary: Cookie`; bài chưa đăng có thêm `Cache-Control: private, no-store` để CDN hay trình duyệt không lưu bản nháp rồi đưa cho người khác.

`sort=top` sắp theo `viewCount`, không có index (cột bị ghi mỗi lượt xem, thêm index thì ghi chậm). MySQL sắp mọi bài đã đăng mỗi lần gọi: ổn với vài nghìn bài, xem lại ở giai đoạn 7. Lượt xem chưa giới hạn tần suất (xem mục Giới hạn tần suất) nên tab "Nhiều người đọc" dễ bị đẩy số tới khi làm giai đoạn 4.

Lỗi khi đăng: `VALIDATION_ERROR` kèm `fields` (`content` khi không có chữ lẫn ảnh, `category` khi danh mục không còn, `mediaIds` khi file không phải của mình, đã gắn bài khác, hoặc không có).

### Ảnh, video (`modules/files`, ADR 0005)

| Method | Đường dẫn    |     | Mô tả                                                                                                                                                                                                                              |
| ------ | ------------ | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/files`     | 🔒  | Tải một file, multipart trường `file`. Ảnh JPG/PNG/WebP đến 5 MB, video MP4/WebM đến 25 MB, nhận loại bằng chữ ký nhị phân. Trả 201 + `MediaItem { id, kind, mimeType }`, chưa gắn bài. Quá 25 MB: 413. Giới hạn 30 file / 10 phút |
| GET    | `/files/:id` | 🔒  | Nội dung file. Ảnh đại diện và file trong bài đã đăng: mọi thành viên; còn lại chỉ người tải lên và admin, người khác 404. Có `Range` (tua video), `Cache-Control: private`, `X-Content-Type-Options: nosniff`                     |

Frontend lấy đường dẫn bằng `fileUrl(baseUrl, id)` trong api-client (ảnh đại diện: `avatarUrl(baseUrl, user)`, xem `UserSummary`); web dùng thẳng trong `<img>`, `<video>` (trình duyệt tự gửi cookie, web và backend cùng site).

Kiểu khai báo ở `api/src/types/post.ts`, `media.ts`, `user.ts`, `tag.ts`; schema query ở `api/src/schemas/post.ts`, `search.ts`, `tag.ts`.

### Tìm kiếm (`modules/search`)

| Method | Đường dẫn                    |     | Mô tả                                                                                   |
| ------ | ---------------------------- | --- | --------------------------------------------------------------------------------------- |
| GET    | `/search?q=&category=&page=` | 🔒  | Tìm theo tiêu đề, tóm tắt, tag; có dấu / không dấu đều được. Query: `searchQuerySchema` |

Trả `PostListItem[]` có phân trang, bài liên quan nhất trước (cùng mức thì mới nhất trước). Mọi từ đều phải có trong bài. Ký tự ngoài chữ và số (kể cả toán tử boolean của MySQL) bị bỏ. `q` rỗng, hoặc chỉ có ký tự đặc biệt, trả danh sách rỗng, không truy vấn database. `api.search.posts` trả rỗng ngay mà không gọi backend. Cách tìm: `docs/co-so-du-lieu.md`, mục Tìm kiếm tiếng Việt.

### Bình luận (`modules/comments`)

| Method | Đường dẫn             |     | Mô tả                                                                                                                                           |
| ------ | --------------------- | --- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/posts/:id/comments` | 🔒  | `CommentThread[]`: bình luận gốc cũ trước, mỗi cái kèm `replies[]` (cũng cũ trước). Bài không xem được: 404. `Cache-Control: private, no-store` |
| POST   | `/posts/:id/comments` | 🔒  | Body `createCommentSchema`: `{ content, parentId? }`. Trả 201 + `CommentItem`. Bài đã bị ẩn: 403 (chủ bài) hoặc 404 (người khác)                |
| PATCH  | `/comments/:id`       | 🔒  | Body `updateCommentSchema`: `{ content }`. Sửa bình luận của mình, đặt `editedAt`. Của người khác: 403                                          |
| DELETE | `/comments/:id`       | 🔒  | Xóa hẳn bình luận của mình, trả lời bên dưới bị xóa theo. 204. Của người khác: 403                                                              |

`CommentItem`: `id, postId, parentId, content, author (UserSummary), status, createdAt, editedAt`. `CommentThread` thêm `replies: CommentItem[]`. `content` là chữ thường (tối đa `LIMITS.COMMENT_MAX` = 2000 ký tự, đã cắt khoảng trắng hai đầu): frontend hiện dạng text, giữ xuống dòng, không render Markdown hay HTML. `editedAt` khác `null` thì hiện "đã sửa"; trưởng xóm ẩn, hiện bình luận không đổi `editedAt`.

- **Một cấp trả lời**: `parentId` là bình luận đang trả lời (gốc hay trả lời đều được); backend luôn gắn vào bình luận gốc của nhánh. Frontend tự điền `@tên ` vào đầu nội dung khi trả lời một trả lời. `parentId` không có, thuộc bài khác, hoặc (cùng bình luận gốc của nó) đã ẩn với người gửi: 400 với `fields.parentId`.
- **Bình luận đã ẩn** (`status: HIDDEN`): người thường, kể cả người viết, không thấy, và không thấy cả các trả lời của nó; trưởng xóm thấy kèm `status` để hiện mờ. Người viết sửa, xóa bình luận đã ẩn: 404.
- Người khác (kể cả trưởng xóm) sửa, xóa bình luận đang hiện: 403. Trưởng xóm ẩn, xóa bình luận của người khác bằng route admin.

### Danh mục, tag, người dùng

| Method | Đường dẫn          |     | Mô tả                                                                                                                                                                                             |
| ------ | ------------------ | --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/categories`      | 🔒  | Tất cả danh mục, kèm số bài                                                                                                                                                                       |
| GET    | `/tags?q=`         | 🔒  | Gợi ý tag khi gõ (tối đa 10), tên hoặc slug chứa `q`, có dấu hay không. `q` rỗng: tag dùng nhiều nhất                                                                                             |
| GET    | `/tags/:slug`      | 🔒  | Một tag (`Tag`), làm tiêu đề trang `/tag/<slug>` kể cả khi tag chưa có bài. Không có: 404                                                                                                         |
| GET    | `/users/:username` | 🔒  | Hồ sơ (`PublicProfile`: phần mọi thành viên thấy). Bài đã đăng lấy bằng `GET /posts?author=<username>`. Không có: 404                                                                             |
| GET    | `/me`              | 🔒  | Thông tin của tôi (gồm `role`)                                                                                                                                                                    |
| PATCH  | `/me`              | 🔒  | Sửa tên, giới thiệu, ảnh đại diện. Body: `updateMeSchema`. Gửi `image` (link hoặc `null`) thì bỏ luôn ảnh đã tải lên, xóa file                                                                    |
| PUT    | `/me/avatar`       | 🔒  | Đổi ảnh đại diện, multipart trường `file`: ảnh JPG/PNG/WebP đến 5 MB (video, file khác: 400). Lưu ở `media/avatars`, xóa ảnh cũ. Trả `Me`. Đếm chung giới hạn 30 file / 10 phút với `POST /files` |
| GET    | `/auth/providers`  | 🌐  | `{ email, google, github }`: cách đăng nhập đang bật (thiếu khóa OAuth thì `false`, frontend ẩn nút)                                                                                              |

`Category`: `id, name, slug, description, color, icon, postCount`. `postCount` chỉ đếm bài đã đăng.
`Tag`: `id, name, slug`.
`color` (trong `Category` và `category` của bài) là khóa màu badge: `amber | blue | green | purple | rose` (`CATEGORY_COLORS` trong `api`, MASTER mục 2.2). Sau này có thể thêm màu, nên client gặp giá trị lạ thì dùng `toCategoryColor` để về màu mặc định, không báo lỗi.
`icon` (chỉ trong `Category`, thêm 2026-11-12) là khóa biểu tượng danh mục: `tea | chip | notebook | moon | question` hoặc `null` (chưa có, frontend hiện chấm màu). `CATEGORY_ICONS` trong `api`, MASTER mục 6. Gặp khóa lạ thì dùng `toCategoryIcon` (trả `null`), không báo lỗi.
`UserSummary` (tác giả bài): `id, name, username, image, avatarId`. `image` là link ảnh bên ngoài (Google, GitHub), `avatarId` là ảnh tự tải lên (thêm 2026-11-12); frontend hiện ảnh bằng `avatarUrl(baseUrl, user)`: `avatarId` trước, rồi `image`, không có thì chữ cái đầu.
`PublicProfile`: `id, name, username, image, avatarId, bio, role, createdAt, postCount`. Không có `email` và thông tin cấm. `postCount` chỉ đếm bài đã đăng. Người bị cấm vẫn có hồ sơ (bài cũ của họ vẫn hiện), hồ sơ không cho biết ai bị cấm.

Ràng buộc `username` trong `api` (chỉ a-z, 0-9, tối đa 20 ký tự) hẹp hơn cột `user.username` (50 ký tự). Sau này cho người dùng tự đặt username theo quy tắc rộng hơn thì phải nới schema cùng lúc, nếu không `?author=` và `/users/:username` sẽ từ chối username hợp lệ. Nới ra là được phép trong v1, siết lại thì không.
`Me`: `id, name, email, username, image, avatarId, bio, role, createdAt`. Người bị cấm gọi route 🔒 nhận 403 kèm lý do trong `message`.

### Đăng nhập (`/api/auth/*`, Better Auth)

Không nằm dưới `/api/v1`, định dạng phản hồi là của Better Auth (lỗi: `{ code, message }`). Frontend gọi qua Better Auth client, không qua `api-client`. Các endpoint đang dùng:

| Method | Đường dẫn                  | Mô tả                                                                                |
| ------ | -------------------------- | ------------------------------------------------------------------------------------ |
| POST   | `/api/auth/sign-up/email`  | Đăng ký `{ name, email, password }` (schema `signUpSchema`), vai trò mặc định `user` |
| POST   | `/api/auth/sign-in/email`  | Đăng nhập. Sai 5 lần/phút bị chặn (429)                                              |
| POST   | `/api/auth/sign-in/social` | Google/GitHub (chỉ khi backend có khóa)                                              |
| POST   | `/api/auth/sign-out`       | Đăng xuất                                                                            |
| GET    | `/api/auth/get-session`    | Phiên hiện tại                                                                       |

Mã lỗi Better Auth → câu tiếng Việt: `authErrorMessage()` trong `api/src/constants/auth-messages.ts`. Origin được tin (chống CSRF): các origin trong `CORS_ORIGINS`, `xomnho://` (app), `exp://**` khi không phải production.

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

| Method | Đường dẫn                 | Mô tả                                                                                                |
| ------ | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| POST   | `/admin/categories`       | Thêm. Body có `color` và `icon` (khóa trong `CATEGORY_COLORS`, `CATEGORY_ICONS`; `icon` được `null`) |
| PATCH  | `/admin/categories/:id`   | Sửa (cùng các trường như khi thêm)                                                                   |
| PUT    | `/admin/categories/order` | Sắp xếp lại. Body: `{ ids: string[] }`                                                               |
| DELETE | `/admin/categories/:id`   | Xóa (chỉ khi không còn bài)                                                                          |
| GET    | `/admin/tags?q=&page=`    | Danh sách kèm số bài                                                                                 |
| POST   | `/admin/tags/:id/merge`   | Gộp vào tag khác. Body: `{ targetId }`                                                               |
| DELETE | `/admin/tags/:id`         | Xóa                                                                                                  |

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
- Tạo bài: tối đa 10 bài / 10 phút mỗi người (`posts.service.ts`).
- Tải file: tối đa 30 file / 10 phút mỗi người (`files.service.ts`).
- Bình luận: tối đa 1 bình luận / 10 giây / người (`comments.service.ts`). Bình luận bị từ chối vì dữ liệu sai không tính.
- Lượt xem (`POST /posts/:id/view`): hiện chưa giới hạn, ai gọi lặp cũng tăng được. Khi làm `infrastructure/rate-limit` (giai đoạn 4), giới hạn theo IP + bài (ví dụ 1 lần / 30 phút).

Bộ đếm lưu trong bộ nhớ (`infrastructure/rate-limit/rate-limiter.ts`, cửa sổ trượt theo khóa); khi chạy nhiều instance thì chuyển sang MySQL hoặc Redis.
