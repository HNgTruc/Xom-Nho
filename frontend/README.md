# frontend

Ba ứng dụng giao diện, đều gọi API của `backend/`, và design system `ui/` dùng chung cho cả ba:

| Thư mục                    | Công nghệ    | Dành cho                                                |
| -------------------------- | ------------ | ------------------------------------------------------- |
| [web/](web/)               | Next.js      | Khách, hàng xóm, cây bút: đọc, tìm, viết bài, bình luận |
| [admin/](admin/)           | React + Vite | Trưởng xóm: duyệt bài, quản lý nội dung và thành viên   |
| [mobile-app/](mobile-app/) | Expo         | Như web, trên điện thoại                                |
| [ui/](ui/)                 | shadcn/ui    | Design system: token cho cả ba, component cho web/admin |

Quy tắc chung:

- Không app nào import code của app khác. Cần dùng chung thì đưa vào [`ui/`](ui/) (giao diện) hoặc [`api/`](../api/) (kiểu, schema, gọi API).
- Gọi backend qua `@xom-nho/api/api-client`, không tự viết `fetch` rải rác.
- Code chia theo tính năng trong `src/features/`; thư mục định tuyến (`app/`, `routes/`) chỉ ghép các feature lại.
