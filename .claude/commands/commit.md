---
description: Soạn commit message theo Conventional Commits cho thay đổi hiện tại
---

# Soạn commit

Chỉ **soạn** message: trong repo chỉ chủ dự án được commit (`.claude/CLAUDE.md`, mục "Không được làm"). Claude không chạy `git add`, `git commit`.

1. `git status` và `git diff --staged`. Chưa có gì staged thì xem `git diff` và đề xuất nhóm file cho từng commit.
2. Thay đổi gồm nhiều ý không liên quan (ví dụ vừa sửa backend vừa đổi màu ui) thì đề xuất tách nhiều commit, liệt kê file cho từng commit.
3. Soạn message bằng **tiếng Anh**:

   ```
   <type>(<scope>): <mô tả ngắn, thì hiện tại, chữ thường, không dấu chấm cuối>

   <thân: vì sao thay đổi, nếu cần>
   ```

   - `type`: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`
   - `scope`: `backend`, `web`, `admin`, `mobile`, `ui`, `api`, `db`, `auth`, `docker`, `claude`, `docs`
   - Dòng đầu tối đa 72 ký tự

4. Kiểm tra không có file nhạy cảm bị stage (`.env`, khóa, file lớn). Có thì cảnh báo.
5. Hiện message (và lệnh `git add <file>...` gợi ý cho từng commit) để chủ dự án tự chạy. Không tự commit.
