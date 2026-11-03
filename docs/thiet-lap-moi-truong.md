# Thiết lập môi trường (Windows)

## 1. Cài công cụ

| Công cụ                | Ghi chú                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Node.js 22 LTS trở lên | https://nodejs.org                                                                                                                  |
| pnpm                   | Sau khi cài Node: `corepack enable` (PowerShell **Administrator**). Phiên bản pnpm lấy từ `packageManager` trong `package.json` gốc |
| Git                    | Kèm Git Bash (Claude Code trên Windows cần Git Bash)                                                                                |
| Docker Desktop         | Bật WSL 2 backend khi cài                                                                                                           |
| VS Code                | Extension gợi ý: ESLint, Prettier, Tailwind CSS IntelliSense, Prisma, Expo Tools                                                    |
| Expo Go                | Cài trên điện thoại (CH Play / App Store)                                                                                           |

Kiểm tra: `node -v`, `pnpm -v`, `docker -v`.

## 2. Biến môi trường

```bash
cp .env.example .env
```

Điền mật khẩu MySQL và `BETTER_AUTH_SECRET` (bắt buộc, ít nhất 32 ký tự; thiếu thì backend không khởi động). Tạo chuỗi ngẫu nhiên:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Khóa Google/GitHub để trống cũng được, nút đăng nhập tương ứng sẽ ẩn.

Mỗi phần đọc biến môi trường ở đâu:

| Phần       | File                        | Biến chính                                             |
| ---------- | --------------------------- | ------------------------------------------------------ |
| Docker     | `.env` ở gốc                | `MYSQL_*`                                              |
| backend    | `backend/.env`              | `DATABASE_URL`, `BETTER_AUTH_*`, `CORS_ORIGINS`, OAuth |
| web        | `frontend/web/.env.local`   | `API_URL`, `NEXT_PUBLIC_API_URL`                       |
| admin      | `frontend/admin/.env.local` | `VITE_API_URL`                                         |
| mobile-app | `frontend/mobile-app/.env`  | `EXPO_PUBLIC_API_URL`                                  |

`.env.example` ở gốc là danh sách đầy đủ; chép phần tương ứng vào từng file. Bắt buộc có `backend/.env` (thiếu `DATABASE_URL` thì backend dừng ngay lúc khởi động và báo thiếu biến nào); cách nhanh nhất là `cp .env backend/.env`, biến thừa được bỏ qua. Khi chạy trên máy, web và admin không cần file riêng (mặc định gọi `http://localhost:4000`), app điện thoại tự đoán IP (xem mục 5). Biến có tiền tố `NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_` sẽ lộ ra trình duyệt/app, không để bí mật vào đó.

## 3. Database

```bash
docker compose up -d
docker compose ps          # mysql phải "healthy"
```

- MySQL: `localhost:3307` (cổng 3307 để không đụng MySQL/XAMPP có sẵn trên máy).
- Adminer: http://localhost:8080, Server: `mysql`, user và mật khẩu theo `.env`.

File `docker/mysql/init/01-grant-shadow-db.sql` chỉ chạy **lần đầu** tạo container. Nếu đổi `MYSQL_USER` sau đó, phải xóa volume (`docker compose down -v`, mất dữ liệu) hoặc tự cấp quyền trong Adminer.

Lỗi hay gặp:

- `port is already allocated`: có chương trình khác dùng cổng 3307 hoặc 8080. Đổi số bên trái trong `ports` ở `docker-compose.yml` và sửa `DATABASE_URL`.
- Prisma báo không tạo được shadow database: user thiếu quyền, xem lại bước trên.

## 4. Chạy backend, web, admin

```bash
pnpm install
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
pnpm dev:web          # backend + web
pnpm dev:admin        # backend + admin
pnpm dev              # tất cả
```

| Địa chỉ                             | Là gì                                                  |
| ----------------------------------- | ------------------------------------------------------ |
| http://localhost:4000/api/v1/health | Backend còn sống không                                 |
| http://localhost:3000               | Web                                                    |
| http://localhost:5173               | Admin (đăng nhập bằng tài khoản trưởng xóm trong seed) |

Tài khoản mẫu sau khi chạy seed (chỉ ở máy dev), mật khẩu đều là `xomnho123`:

| Email                    | Vai trò              |
| ------------------------ | -------------------- |
| `truongxom@xomnho.local` | Trưởng xóm (`admin`) |
| `lananh@xomnho.local`    | Cây bút (`author`)   |
| `baongoc@xomnho.local`   | Hàng xóm (`user`)    |
| http://localhost:8080    | Adminer              |

## 5. Chạy app trên điện thoại thật bằng Expo Go

Điện thoại không hiểu `localhost` là máy tính của bạn, nên app phải gọi API qua IP mạng Wi-Fi.

1. Máy tính và điện thoại **cùng một mạng Wi-Fi** (mạng trường/công ty đôi khi chặn các máy nói chuyện với nhau, khi đó dùng điểm phát từ điện thoại).
2. Lấy IP máy tính: chạy `ipconfig`, xem dòng **IPv4 Address** của card Wi-Fi, ví dụ `192.168.1.5`.
3. Thường **không cần** bước này: không có `EXPO_PUBLIC_API_URL` thì app lấy IP của máy đang chạy Metro (chính là máy chạy backend) và gọi cổng 4000 (`src/lib/api-url.ts`). Chỉ khi máy có nhiều card mạng và app đoán sai IP (màn hình hiện địa chỉ đang gọi), đặt `EXPO_PUBLIC_API_URL=http://192.168.1.5:4000` trong `frontend/mobile-app/.env`.
4. Backend đã lắng nghe mọi địa chỉ (`app.listen(port, "0.0.0.0")` trong `backend/src/main.ts`), không cần sửa.
5. Mở cổng trên Windows Firewall (chạy PowerShell **với quyền Administrator**, chỉ cần một lần):

   ```powershell
   New-NetFirewallRule -DisplayName "Xom Nho dev (backend)" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow -Profile Private
   New-NetFirewallRule -DisplayName "Xom Nho dev (Expo)" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow -Profile Private
   ```

   Mạng Wi-Fi trong Windows phải đặt là **Private network**.

6. Kiểm tra: mở trình duyệt trên điện thoại, vào `http://192.168.1.5:4000/api/v1/health`. Thấy JSON là thông.
7. `pnpm dev:mobile` (hoặc `pnpm --filter mobile-app start` khi backend đã chạy), quét QR bằng Expo Go (Android) hoặc Camera (iPhone). Expo Go trên điện thoại phải hỗ trợ đúng SDK của app (xem `expo` trong `frontend/mobile-app/package.json`); cập nhật Expo Go nếu nó báo không tương thích. Phím tắt của Expo (`r` tải lại, `j` mở debugger) chỉ dùng được khi chạy `pnpm --filter mobile-app start` riêng, không qua turbo.

### Đăng nhập Expo (bắt buộc với iPhone)

Expo Go trên iOS (SDK 58) đòi **cả Expo Go lẫn Expo CLI trên máy tính** cùng đăng nhập một tài khoản, nếu không sẽ báo _"You're signed in to Expo Go as ..., but not signed in to Expo CLI"_. Đăng xuất Expo Go không giải quyết được (sẽ báo cần đăng nhập cả hai).

Trên Windows, `npx expo login` (bản CLI đi kèm SDK 58) bị lỗi khi tự mở trình duyệt (`cmd.exe /c start "" https://expo.dev/login?...` thoát với mã 1) rồi dừng luôn. Cách đi vòng, chỉ cần làm một lần cho mỗi máy (chạy trong `frontend/mobile-app`, PowerShell):

```powershell
$env:NODE_OPTIONS="--unhandled-rejections=warn"
npx expo login --browser
Remove-Item Env:NODE_OPTIONS
```

Lệnh in ra dòng _"visit this link to log in: https://expo.dev/login?..."_ và chờ. Copy link đó mở bằng trình duyệt, đăng nhập (kể cả bằng GitHub/Google), bấm **Approve**; terminal báo `Logged in`. Kiểm tra bằng `npx expo whoami`. Sau đó **khởi động lại Metro** (`Ctrl+C`, `pnpm dev:mobile`) vì Metro chỉ đọc trạng thái đăng nhập lúc khởi động.

Tài khoản có mật khẩu (đăng ký bằng email) thì dùng gọn hơn: `npx expo login --no-browser`. Cách khác cho mọi loại tài khoản: tạo access token ở expo.dev → Account settings → Access tokens, rồi đặt `$env:EXPO_TOKEN="..."` trong terminal trước khi chạy Metro (không lưu token vào repo).

IP có thể đổi khi bạn đổi mạng; nếu app báo lỗi mạng, kiểm tra lại bước 2 và 3. Không vào được dù đã làm đủ: thử `npx expo start --tunnel`.

## 6. Claude Code

- Mở Claude Code ở thư mục gốc repo. Nó tự đọc `CLAUDE.md` và `.claude/`.
- Muốn ghi chú riêng cho máy mình: đổi tên `CLAUDE.local.md.example` thành `CLAUDE.local.md`.
- Hook tự format cần Prettier, có sau khi chạy `pnpm install` ở gốc.
