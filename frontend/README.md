# frontend

Ba ứng dụng giao diện, đều gọi API của `backend/`:

| Thư mục                    | Công nghệ    | Dành cho                                                |
| -------------------------- | ------------ | ------------------------------------------------------- |
| [web/](web/)               | Next.js      | Khách, hàng xóm, cây bút: đọc, tìm, viết bài, bình luận |
| [admin/](admin/)           | React + Vite | Trưởng xóm: duyệt bài, quản lý nội dung và thành viên   |
| [mobile-app/](mobile-app/) | Expo         | Như web, trên điện thoại                                |

Quy tắc chung:

- Không app nào import code của app khác. Cần dùng chung thì đưa vào [`ui/`](../ui/) (giao diện) hoặc [`shared/`](../shared/) (kiểu, schema, gọi API).
- Gọi backend qua `@xom-nho/shared/api-client`, không tự viết `fetch` rải rác.
- Code chia theo tính năng trong `src/features/`; thư mục định tuyến (`app/`, `routes/`) chỉ ghép các feature lại.
