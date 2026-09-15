# Task Manager App

Ứng dụng quản lý project, task và comment với React/Vite ở frontend, Express/Prisma ở backend và PostgreSQL làm cơ sở dữ liệu.

## Yêu cầu

- Node.js 20 trở lên
- npm
- Docker và Docker Compose (hoặc PostgreSQL 16 đang chạy cục bộ)

## Cấu trúc

- `backend/`: REST API, xác thực JWT, Prisma và Socket.io
- `frontend/`: giao diện React/Vite
- `docker-compose.yml`: PostgreSQL 16

## Cài đặt và chạy

### 1. Khởi động PostgreSQL

Từ thư mục gốc:

```bash
docker compose up -d postgres
```

Database mặc định:

- Host: `localhost`
- Port: `5432`
- Database: `task_manager`
- User: `admin`
- Password: `admin123`

### 2. Cấu hình backend

Tạo file `backend/.env`:

```env
DATABASE_URL="postgresql://admin:admin123@localhost:5432/task_manager?schema=public"
JWT_SECRET="thay-bang-mot-chuoi-bi-mat-dai-va-ngau-nhien"
PORT=3000
NODE_ENV=development
```

Không commit file `.env` hoặc giá trị secret thật lên Git.

### 3. Cài dependency và migrate database

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

Chạy backend ở chế độ development:

```bash
npm run dev
```

API mặc định chạy tại `http://localhost:3000`.

### 4. Chạy frontend

Mở terminal thứ hai:

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`. Nếu port này đang được sử dụng, Vite sẽ chọn port khác và in URL trong terminal.

## API

Các endpoint bên dưới, ngoại trừ health check và auth, yêu cầu header:

```http
Authorization: Bearer <jwt-token>
```

| Method | Endpoint | Mô tả |
| --- | --- | --- |
| GET | `/health` | Kiểm tra server |
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập và nhận JWT |
| GET | `/api/projects` | Danh sách project của user |
| GET | `/api/projects/:id` | Chi tiết project và task |
| POST | `/api/projects` | Tạo project |
| PUT | `/api/projects/:id` | Đổi tên project |
| DELETE | `/api/projects/:id` | Xóa project và dữ liệu liên quan |
| GET | `/api/tasks?projectId=:id` | Danh sách task của project |
| GET | `/api/tasks/:id` | Chi tiết task và comment |
| POST | `/api/tasks` | Tạo task |
| PUT | `/api/tasks/:id` | Cập nhật title, description hoặc status |
| DELETE | `/api/tasks/:id` | Xóa task và comment liên quan |
| GET | `/api/comments?taskId=:id` | Danh sách comment của task |
| POST | `/api/comments` | Tạo comment |
| DELETE | `/api/comments/:id` | Xóa comment |

Task có ba trạng thái: `TODO`, `IN_PROGRESS` và `DONE`.

## Kiểm tra

Frontend:

```bash
cd frontend
npm run build
npm run lint
```

Backend:

```bash
cd backend
npm test
```

## Socket.io

Backend phát các event realtime trong room `project-<projectId>` khi project, task hoặc comment thay đổi. Socket server chạy cùng port với Express. Trong môi trường production, cần giới hạn CORS về domain frontend và xác thực quyền truy cập trước khi cho client tham gia room.
