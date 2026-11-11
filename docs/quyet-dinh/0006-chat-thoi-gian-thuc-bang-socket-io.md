# 0006. Tin nhắn riêng thời gian thực bằng Socket.IO

- Trạng thái: Đã chấp nhận
- Ngày: 2026-11-11

## Bối cảnh

Hàng xóm nhắn tin riêng cho nhau, gửi kèm ảnh, video. Chủ dự án muốn tin nhắn hiện ra ngay khi người kia gửi. Người chưa kết bạn vẫn nhắn được, nhưng tin rơi vào hộp **Tin nhắn chờ** của người nhận cho tới khi người nhận chấp nhận.

## Quyết định

Dùng Socket.IO qua module chính thức của NestJS. Thêm ba thư viện (chủ dự án đã đồng ý): `@nestjs/websockets`, `@nestjs/platform-socket.io` (backend), `socket.io-client` (web, sau này mobile).

- **Gửi tin vẫn qua REST** (`POST /api/v1/conversations/:id/messages`): kiểm tra dữ liệu bằng schema Zod trong `api`, kiểm tra quyền, lưu DB như mọi API khác. WebSocket chỉ dùng để **đẩy** sự kiện tới người nhận (`message:new`, `message:read`, `typing`), không nhận lệnh ghi dữ liệu nào ngoài "đang gõ".
- Xác thực kết nối bằng phiên Better Auth (cookie khi bắt tay), mỗi người dùng vào một phòng riêng `user:<id>`.
- Mất kết nối thì client tải lại tin bằng REST khi nối lại, nên không mất tin.

Phương án đã cân nhắc:

- **Hỏi lại mỗi 3 giây**: không thêm thư viện, nhưng trễ tới 3 giây, không có "đang gõ", tốn request.
- **Server-Sent Events**: một chiều, không cần thư viện, nhưng không gửi được "đang gõ" và React Native không hỗ trợ sẵn.
- **WebSocket thuần (`ws`)**: nhẹ hơn, nhưng phải tự làm phòng, tự nối lại, tự heartbeat.

## Hệ quả

- Tin nhắn, đã xem, đang gõ hiện ngay; app Expo dùng lại được `socket.io-client`.
- Backend giữ kết nối mở: khi chạy nhiều bản backend phải thêm adapter Redis cho Socket.IO (ghi ở giai đoạn Hoàn thiện).
- Thêm một bề mặt cần rà soát bảo mật: xác thực khi bắt tay, giới hạn tần suất sự kiện "đang gõ", CORS cho WebSocket.
