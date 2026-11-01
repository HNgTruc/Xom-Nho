---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "backend/test/**"
  - "frontend/web/e2e/**"
  - "**/vitest.config.*"
  - "**/jest.config.*"
  - "**/playwright.config.*"
---

# Quy tắc viết test

| Phần             | Công cụ                                       | Test gì                                                     |
| ---------------- | --------------------------------------------- | ----------------------------------------------------------- |
| `shared`         | Vitest                                        | tiện ích tiếng Việt, schema Zod                             |
| `backend`        | Jest (mặc định NestJS) hoặc Vitest nếu đã đổi | policy, service (ca được phép và bị từ chối), e2e cho route |
| `frontend/web`   | Playwright                                    | luồng chính: đăng ký, viết bài, bình luận                   |
| `frontend/admin` | Vitest + Testing Library                      | component phức tạp (bảng, form) khi cần                     |

- Test đơn vị đặt cạnh file (`posts.service.spec.ts`); e2e backend ở `backend/test/e2e/`; Playwright ở `frontend/web/e2e/`.
- Tên test tiếng Việt, mô tả hành vi: `it("hàng xóm gửi bài thì bài ở trạng thái chờ duyệt")`.
- Mỗi test: chuẩn bị, thực hiện, kiểm tra. Một test một hành vi.
- Policy và service có test cho **mỗi vai trò**: khách, `user`, `author`, `admin`, người bị cấm.
- Route admin có e2e kiểm tra người không phải admin nhận 403.
- Test cần DB dùng database riêng (`xom_nho_test` trên cùng container), dọn dữ liệu trước mỗi test. Không chạy test trên database dev.
- Không gọi mạng thật ra ngoài (OAuth, dịch vụ bên thứ ba).
- Playwright chọn phần tử bằng role và tên tiếng Việt, không bằng class CSS.
- Sửa lỗi: viết test tái hiện lỗi trước, thấy đỏ, rồi mới sửa.
