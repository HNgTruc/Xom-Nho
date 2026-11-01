-- Chạy một lần khi container MySQL được tạo lần đầu (volume còn trống).
-- `prisma migrate dev` cần tạo "shadow database" tạm thời để so sánh schema,
-- nên user của app phải có quyền tạo/xóa database. Chỉ dùng cho môi trường dev.
-- Lưu ý: tên user phải khớp MYSQL_USER trong .env (mặc định: xomnho).

GRANT ALL PRIVILEGES ON *.* TO 'xomnho'@'%';
FLUSH PRIVILEGES;
