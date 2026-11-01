# Tài liệu Xóm Nhỏ

Đọc theo thứ tự này nếu mới vào project:

1. [tinh-nang.md](tinh-nang.md): Xóm Nhỏ làm được gì, tiêu chí hoàn thành từng tính năng
2. [kien-truc.md](kien-truc.md): các phần ghép với nhau thế nào, cây thư mục, tầng trong backend/frontend
3. [phan-quyen.md](phan-quyen.md): ai được làm gì
4. [co-so-du-lieu.md](co-so-du-lieu.md): bảng, quan hệ, tìm kiếm
5. [api.md](api.md): hợp đồng giữa app và server
6. [giong-van-va-giao-dien.md](giong-van-va-giao-dien.md): cách xưng hô, câu mẫu; giao diện chi tiết ở [design-system/xom-nho/MASTER.md](../design-system/xom-nho/MASTER.md)
7. [thiet-lap-moi-truong.md](thiet-lap-moi-truong.md): cài đặt trên máy
8. [lo-trinh.md](lo-trinh.md): làm gì trước, làm gì sau

Quyết định kỹ thuật quan trọng được ghi trong [quyet-dinh/](quyet-dinh/), mỗi quyết định một file đánh số (ADR).

## Khi nào cập nhật tài liệu

- Thêm/đổi bảng: sửa `co-so-du-lieu.md` trong cùng commit với migration.
- Thêm/đổi endpoint: sửa `api.md` và `shared/src/api-client` trong cùng commit.
- Đổi quyền của một vai trò: sửa `phan-quyen.md`.
- Chọn công nghệ mới hoặc bỏ một lựa chọn cũ: thêm file ADR mới, không sửa ADR cũ (chỉ đánh dấu "Đã thay thế bởi ...").
