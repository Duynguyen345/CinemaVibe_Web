// routes/users.js – API thông tin người dùng & đăng ký
const express = require('express');
const { poolPromise } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const userResult = await pool.request()
      .input('id', req.user.id)
      .query('SELECT id, full_name, email, phone, avatar_url, role, created_at FROM users WHERE id = @id');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản.' });
    }

    const subsResult = await pool.request()
      .input('id', req.user.id)
      .query(`
        SELECT TOP 1 s.end_date, s.status, p.name as plan_name, p.quality, p.max_screens, p.can_download
        FROM subscriptions s
        JOIN subscription_plans p ON s.plan_id = p.id
        WHERE s.user_id = @id AND s.status = 'active' AND s.end_date >= GETDATE()
        ORDER BY s.end_date DESC
      `);

    res.json({
      success: true,
      data: {
        ...userResult.recordset[0],
        subscription: subsResult.recordset.length > 0 ? subsResult.recordset[0] : null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.get('/watchlist', authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', req.user.id)
      .query(`
        SELECT m.id, m.title, m.genre, m.year, m.rating, m.poster_url, w.added_at
        FROM watchlist w
        JOIN movies m ON w.movie_id = m.id
        WHERE w.user_id = @id AND m.is_active = 1
        ORDER BY w.added_at DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.post('/watchlist/:movieId', authMiddleware, async (req, res) => {
  try {
    const { movieId } = req.params;
    const pool = await poolPromise;
    
    const existing = await pool.request()
      .input('userId', req.user.id)
      .input('movieId', movieId)
      .query('SELECT id FROM watchlist WHERE user_id = @userId AND movie_id = @movieId');

    if (existing.recordset.length > 0) {
      await pool.request()
        .input('userId', req.user.id)
        .input('movieId', movieId)
        .query('DELETE FROM watchlist WHERE user_id = @userId AND movie_id = @movieId');
      res.json({ success: true, action: 'removed', message: 'Đã xoá khỏi danh sách yêu thích.' });
    } else {
      await pool.request()
        .input('userId', req.user.id)
        .input('movieId', movieId)
        .query('INSERT INTO watchlist (user_id, movie_id) VALUES (@userId, @movieId)');
      res.json({ success: true, action: 'added', message: 'Đã thêm vào danh sách yêu thích! ❤️' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', req.user.id)
      .query(`
        SELECT TOP 20 m.id, m.title, m.genre, m.poster_url, h.progress_sec, h.completed, h.last_watched_at
        FROM watch_history h
        JOIN movies m ON h.movie_id = m.id
        WHERE h.user_id = @id
        ORDER BY h.last_watched_at DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
