-- Tạo lại FULLTEXT trên post.searchText KHÔNG dùng stopword.
-- Danh sách stopword mặc định của InnoDB (a, an, de, en, i, la...) trùng với từ tiếng Việt đã bỏ dấu
-- ("ăn", "để", "dễ", "là"...), nên index cũ bỏ qua các từ này: tìm "do an" không ra "đồ ăn".
-- InnoDB ghi cách xử lý stopword vào index lúc tạo, nên chỉ cần tắt trong phiên của migration này,
-- không phụ thuộc cấu hình server (máy dev hay server deploy đều đúng).
SET SESSION innodb_ft_enable_stopword = OFF;

ALTER TABLE `post` DROP INDEX `post_searchText_idx`;

-- Giữ đúng tên Prisma đặt cho @@fulltext([searchText]) để schema không bị lệch
ALTER TABLE `post` ADD FULLTEXT INDEX `post_searchText_idx`(`searchText`);

SET SESSION innodb_ft_enable_stopword = ON;
