# Backend – CinéVibe API

## Cách chạy

### 1. Cài dependencies
```
cd backend
npm install
```

### 2. Tạo file .env (copy từ .env.example)
```
cp .env.example .env
```
Rồi điền thông tin MySQL của bạn vào file `.env`

### 3. Tạo database
Chạy file `database/schema.sql` trong MySQL Workbench hoặc phpMyAdmin

### 4. Khởi động server
```
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

---

## API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| POST | /api/auth/register | Đăng ký tài khoản |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/movies | Lấy danh sách phim |
| GET | /api/movies/trending | Phim đang hot |
| GET | /api/movies/search?q= | Tìm kiếm phim |
| GET | /api/movies/:id | Chi tiết 1 phim |
| GET | /api/users/me | Thông tin tài khoản (cần đăng nhập) |
| GET | /api/subscriptions/me | Gói đang dùng (cần đăng nhập) |
