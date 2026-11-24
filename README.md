# Thời Gian Biểu Tanas

Ứng dụng quản lý thời gian biểu phong cách **sổ tay vẽ tay (Sketchy & Doodle)** dành cho cả **Máy tính (16:9)**, **Tablet (3:4)** và **Điện thoại (9:16)**, kèm backend Node.js hoàn chỉnh để chạy cục bộ hoặc triển khai trực tiếp lên server.

---

## Tính năng nổi bật

- **Đăng nhập / Đăng ký tài khoản & Ghi nhớ 30 ngày**:
  - Hỗ trợ tạo tài khoản và đăng nhập trực tiếp trên trình duyệt qua REST API.
  - Checkbox **"Ghi nhớ đăng nhập trong 30 ngày"** duy trì phiên an toàn bằng cookie `HttpOnly` + lưu phiên dài hạn phía server (`30 ngày`).
  - Mỗi tài khoản có vùng lưu lịch riêng (`data/schedules/<userId>.json`), tự động đồng bộ khi thêm/sửa/hoàn thành việc hoặc đổi chế độ Sáng/Tối.
  - Hỗ trợ chế độ Khách / Offline khi mở trực tiếp file hoặc chưa cần tạo tài khoản.
- **Bộ icon vẽ tay Sketchy SVG & Sticker minh họa**:
  - Toàn bộ icon giao diện dùng vector nét bút vẽ tay (`sketchy.js`), tự thích nghi Sáng/Tối kèm hình minh họa thỏ vẽ tay cho bảng trống.
  - Hỗ trợ kéo thả tự do các khung nổi / modal theo thanh tiêu đề và kéo trượt ngang danh sách bảng/chip.
- **Đài Radio & YouTube + Nhạc Chill Offline**: Nhúng YouTube trực tiếp (chạy qua HTTP server để không gặp lỗi nhúng 153) và bộ tạo âm thanh Web Audio offline (`Lofi Piano`, `Tiếng Mưa`, `Sóng Biển`, `Quán Cà Phê`).
- **Đồng hồ Pomodoro & Trợ lý AI Sổ Tay**: Hẹn giờ tập trung gắn vào từng công việc, kết nối Gemini / OpenAI-Compatible API để ghi chú, mở nhạc, tóm tắt lịch.
- **Xuất toàn bộ tuần thành 1 bức ảnh (9:16 / 16:9 / Lưới)**: Chừa sẵn `1/3` trên cho đồng hồ màn hình khóa điện thoại và hỗ trợ nền tối OLED.

---

## API Backend & Frontend

| Endpoint | Method | Mô tả |
| --- | --- | --- |
| `/api/health` | `GET` | Kiểm tra trạng thái máy chủ (`200 OK`) |
| `/api/auth/register` | `POST` | Đăng ký tài khoản (`username`, `password`, `displayName`, `rememberMe`) |
| `/api/auth/login` | `POST` | Đăng nhập & cấp `HttpOnly` cookie (`rememberMe = true` -> 30 ngày) |
| `/api/auth/logout` | `POST` | Xóa phiên hiện tại trên server & xóa cookie |
| `/api/auth/me` | `GET` | Kiểm tra phiên đăng nhập hiện tại |
| `/api/schedule` | `GET` / `PUT` | Tải / lưu lịch cá nhân của người dùng đang đăng nhập |

Mật khẩu được băm bằng `crypto.scryptSync` (salt ngẫu nhiên 16 byte), session token được băm `SHA-256` trước khi lưu xuống `./data/sessions.json`.

---

## Cách chạy

### 1. Chạy cục bộ trên Windows
Nhấp đúp chuột vào **[Mo-Thoi-Gian-Bieu.bat](Mo-Thoi-Gian-Bieu.bat)** (tự khởi chạy `node server.js` ở `http://127.0.0.1:58123`).

### 2. Chạy trên Server / VPS / Cloud (Render, Railway, Fly.io...)
Ứng dụng dùng **100% Node.js thuần (>= 18)**, không cần cài thư viện ngoài (`dependencies: {}`):

```bash
npm start
```

Biến môi trường hỗ trợ (xem `.env.example`):
- `PORT`: Cổng lắng nghe (mặc định `58123`; tự động bind `0.0.0.0` khi biến `PORT` được cấp trên cloud).
- `HOST`: Địa chỉ bind tùy chỉnh.
- `DATA_DIR`: Thư mục lưu `users.json`, `sessions.json` và lịch từng tài khoản (mặc định `./data`).
- `COOKIE_SECURE=1`: Bật ép cờ `Secure` cho cookie khi triển khai HTTPS (tự động bật nếu có header `X-Forwarded-Proto: https`).

### 3. Chạy bằng Docker
```bash
docker build -t timetable-tanas .
docker run -d -p 58123:58123 -v tanas_data:/app/data timetable-tanas
```
