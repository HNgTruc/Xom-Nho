---
paths:
  - "frontend/admin/**"
---

# Quy tắc frontend/admin (React + Vite)

- SPA chỉ dành cho `admin`. Gọi `/api/v1/admin/*` qua `@xom-nho/api/api-client` (cấu hình ở `src/lib/api.ts`, `credentials: "include"`).
- Mỗi màn hình quản trị là một feature trong `src/features/<tính-năng>/{pages,components,api}`, export route qua `index.ts`; `src/app/router.tsx` gom route và lazy load từng trang.
- Dữ liệu server chỉ qua TanStack Query (query key có đủ tham số lọc). Không chép dữ liệu server vào `useState`. Sau mutation thì `invalidateQueries`.
- Trang, bộ lọc, từ khóa, sắp xếp **lưu trên URL** (`useSearchParams`). Ô tìm có debounce khoảng 300ms.
- Mọi bảng dùng `src/components/data-table`; phân trang, lọc, sắp xếp ở server.
- Hành động nguy hiểm qua `ConfirmDialog`; ẩn bài và cấm thành viên bắt buộc nhập lý do (ADR 0008: không còn duyệt, từ chối bài). Có toast báo kết quả.
- Component nền từ `@xom-nho/ui/components/*`.
- `require-admin.tsx` chặn route khi chưa đăng nhập hoặc không phải admin; đây chỉ là trải nghiệm, backend mới chặn thật.
- Biến `VITE_*` công khai, chỉ chứa URL.
- Không import gì từ `frontend/web` hay `frontend/mobile-app`.
