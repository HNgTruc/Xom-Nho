-- Index cho bài đã đăng của một tác giả, mới nhất trước (`GET /posts?author=`, trang hồ sơ).
-- Thay index (authorId, status): index mới có cùng phần đầu nên vẫn phục vụ các truy vấn cũ.
--
-- Đã sửa SQL Prisma tự sinh: bản gốc xóa khóa ngoại post_authorId_fkey mà không tạo lại,
-- và tạo lại post_reviewerId_fkey (đã có, sẽ lỗi). Tạo index mới TRƯỚC rồi mới xóa index cũ
-- thì khóa ngoại authorId luôn có index dùng được, không cần đụng tới khóa ngoại nào.
CREATE INDEX `post_authorId_status_publishedAt_idx` ON `post`(`authorId`, `status`, `publishedAt`);

DROP INDEX `post_authorId_status_idx` ON `post`;
