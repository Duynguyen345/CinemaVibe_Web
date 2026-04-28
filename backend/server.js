// server.js – Điểm khởi động chính của CinéVibe API
require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ================================================
// MIDDLEWARE
// ================================================

// Cho phép Frontend (khác port/domain) gọi API
app.use(cors({
  origin: [
    'http://localhost:5500',   // Frontend local
    'http://127.0.0.1:5500',
    'http://localhost:3001',
    'https://duynguyen345.github.io' // GitHub Pages sau khi deploy
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Đọc JSON từ request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================================
// ROUTES
// ================================================
const authRoutes  = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const userRoutes  = require('./routes/users');

app.use('/api/auth',   authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/users',  userRoutes);

// ================================================
// ROUTE KIỂM TRA SERVER
// ================================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎬 CinéVibe API đang hoạt động!',
    version: '1.0.0',
    endpoints: {
      auth:   '/api/auth/register | /api/auth/login',
      movies: '/api/movies | /api/movies/trending | /api/movies/search?q=',
      users:  '/api/users/me | /api/users/watchlist | /api/users/history'
    }
  });
});

// ================================================
// ROUTE KHÔNG TÌM THẤY (404)
// ================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy endpoint: ${req.method} ${req.url}`
  });
});

// ================================================
// XỬ LÝ LỖI CHUNG
// ================================================
app.use((err, req, res, next) => {
  console.error('❌ Lỗi server:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi server. Vui lòng thử lại sau.'
  });
});

// ================================================
// KHỞI ĐỘNG SERVER
// ================================================
app.listen(PORT, () => {
  console.log('');
  console.log('🎬 ================================');
  console.log(`🎬  CinéVibe API đang chạy!`);
  console.log(`🎬  http://localhost:${PORT}`);
  console.log('🎬 ================================');
  console.log('');
});
