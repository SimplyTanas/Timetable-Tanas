# Thời Gian Biểu Tanas

Ứng dụng quản lý thời gian biểu phong cách **sổ tay vẽ tay (Sketchy & Doodle)** dành cho cả **Máy tính (16:9)**, **Tablet (3:4)** và **Điện thoại (9:16)**, kèm backend Node.js hoàn chỉnh để chạy cục bộ hoặc triển khai trực tiếp lên server.

---

## Tính năng nổi bật

- **Đăng nhập / Đăng ký tài khoản & Ghi nhớ 30 ngày**:
  - Hỗ trợ tạo tài khoản và đăng nhập trực tiếp trên trình duyệt qua REST API.
  - Checkbox **"Ghi nhớ đăng nhập trong 30 ngày"** duy trì phiên an toàn bằng cookie `HttpOnly` + lưu phiên dài hạn phía server (`30 ngày`).
  - Mỗi tài khoản có vùng lưu riêng trong SQLite (`data/tanas.db` qua `node:sqlite`, tự fallback sang JSON trên Node cũ), tự động đồng bộ bảng, công việc, bố cục, giao diện Sáng/Tối, chuỗi streak và tùy chọn Studio (không lưu API key bên thứ ba lên server).
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
| `/api/auth/me` | `GET` | Kiểm tra phiên đăng nhập & thống kê lưu trữ DB |
| `/api/auth/ping` | `POST` | Cập nhật heartbeat trạng thái Online/Offline |
| `/api/auth/profile` | `PUT` / `PATCH` | Cập nhật tên hiển thị hoặc đổi mật khẩu |
| `/api/schedule` | `GET` / `PUT` | Tải / lưu lịch, bố cục (`columns`/`grid`), tùy chọn Studio & AI key (mã hóa AES-256-GCM) |
| `/api/admin/users` | `GET` | *(Admin)* Thống kê thành viên, Online/Offline, biểu đồ tham gia & API key AI |
| `/api/admin/users/:id/role` | `PATCH` | *(Admin)* Cấp / thu hồi quyền Admin |
| `/api/admin/users/:id/ban` | `PATCH` | *(Admin)* Khóa / gỡ khóa tài khoản và ngắt phiên tức thì |
| `/api/admin/users/:id/ai-key` | `GET` / `PUT` / `DELETE` | *(Admin)* Xem / gán / xóa AI API key của tài khoản |

Mật khẩu được băm bằng `crypto.scryptSync` (salt ngẫu nhiên 16 byte), session token được băm `SHA-256` trước khi lưu trong SQLite (`./data/tanas.db`), và AI API key trên server được mã hóa AES-256-GCM bằng khóa cục bộ trong `DATA_DIR` (được loại trừ khỏi Git qua `.gitignore`). Tài khoản admin khởi tạo được cấu hình hoàn toàn qua biến môi trường cục bộ `TANAS_ADMIN_USER` và `TANAS_ADMIN_PASSWORD` (không lưu mật khẩu hay mã băm mặc định trong mã nguồn Git).

---

## Cách chạy

### 1. Chạy cục bộ trên Windows
Nhấp đúp chuột vào **[Mo-Thoi-Gian-Bieu.bat](Mo-Thoi-Gian-Bieu.bat)** (tự khởi chạy `node --no-warnings server.js` ở `http://127.0.0.1:58123`).

### 2. Chạy trên Server / VPS / Cloud (Render, Railway, Fly.io...)
Ứng dụng dùng **100% Node.js thuần** (`node:sqlite` có sẵn từ Node 22.5+, fallback JSON an toàn trên Node >= 18), không cần `npm install` gói ngoài (`dependencies: {}`). Đã kèm sẵn [render.yaml](render.yaml) với Persistent Disk mount tại `/opt/render/project/src/data`:

```bash
npm start
```

Biến môi trường hỗ trợ (xem `.env.example`):
- `PORT`: Cổng lắng nghe (mặc định `58123`; tự động bind `0.0.0.0` khi biến `PORT` được cấp trên cloud).
- `HOST`: Địa chỉ bind tùy chỉnh.
- `DATA_DIR`: Thư mục chứa SQLite `tanas.db` và dữ liệu máy chủ (mặc định `./data`).
- `COOKIE_SECURE=1`: Bật ép cờ `Secure` cho cookie khi triển khai HTTPS (tự động bật nếu có header `X-Forwarded-Proto: https`).

### 3. Chạy bằng Docker
```bash
docker build -t timetable-tanas .
docker run -d -p 58123:58123 -v tanas_data:/app/data timetable-tanas
```
