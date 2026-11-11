---
paths:
  - "backend/src/**"
  - "frontend/web/src/lib/**"
  - "frontend/admin/src/lib/**"
  - "frontend/admin/src/app/**"
  - "frontend/mobile-app/src/lib/**"
---

# Quy tắc bảo mật

## Backend: mỗi endpoint ghi dữ liệu phải trả lời được 4 câu

1. **Ai đang gọi?** `AuthGuard` toàn cục lấy phiên; route nào không cần đăng nhập phải ghi rõ `@Public()`. Người bị cấm bị chặn ở guard.
2. **Có được phép không?** Vai trò: `@Roles()`. Quyền trên bản ghi: hàm trong `*.policy.ts`, gọi trên **bản ghi lấy từ DB**. Không tin `authorId`, `role`, `status` gửi từ client.
3. **Dữ liệu có hợp lệ không?** `ZodValidationPipe` với schema từ `@xom-nho/api`. Chỉ dùng dữ liệu đã parse.
4. **Có bị lạm dụng không?** Tạo bài, bình luận qua `RateLimitService`.

Thêm:

- Mọi route trong `*.admin.controller.ts` có `@Roles("admin")` ở cấp class. Admin không được tự hạ quyền hay tự cấm mình.
- Không trả trường nhạy cảm: không trả `email` của người khác, mật khẩu, token, dữ liệu bảng `account`/`session`.
- Bài chưa đăng của người khác trả `NOT_FOUND`, không trả `FORBIDDEN` (không để lộ sự tồn tại).
- Không nối chuỗi vào SQL. Truy vấn thô chỉ dùng `$queryRaw` dạng tagged template.
- Lỗi trả ra ngoài: thông điệp tiếng Việt chung chung; stack trace, lỗi Prisma chỉ ghi log.
- CORS chỉ cho phép đúng các origin trong `CORS_ORIGINS`, `credentials: true`. Không dùng `origin: "*"`.
- `trustedOrigins` của Better Auth gồm web, admin, scheme của app Expo.

## Frontend

- Không tin vào việc ẩn nút: mọi kiểm tra quyền thật đã ở backend; frontend chỉ ẩn/hiện cho tiện.
- Biến `NEXT_PUBLIC_*`, `VITE_*`, `EXPO_PUBLIC_*` là công khai: chỉ chứa URL, không chứa khóa bí mật.
- Markdown render qua component an toàn (sanitize, chặn `javascript:`, liên kết ngoài có `rel="nofollow ugc noopener"`). Không `dangerouslySetInnerHTML` với dữ liệu người dùng.
- Mobile: phiên lưu bằng `expo-secure-store`, không AsyncStorage.
- Admin: sau khi đăng nhập, `role !== "admin"` thì đăng xuất ngay và báo lỗi.
