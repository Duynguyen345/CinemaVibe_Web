// routes/movies.js – API quản lý phim
const express = require('express');
const { poolPromise } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ================================================
// GET /api/movies – Lấy danh sách phim
// ================================================
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 12, genre, category } = req.query;
    page  = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const pool = await poolPromise;
    let request = pool.request();
    
    let whereClause = 'WHERE is_active = 1';

    if (genre) {
      whereClause += ' AND genre = @genre';
      request.input('genre', genre);
    }
    if (category) {
      whereClause += ' AND category = @category';
      request.input('category', category);
    }

    // Đếm tổng số
    const countResult = await request.query(`SELECT COUNT(*) as total FROM movies ${whereClause}`);
    const total = countResult.recordset[0].total;

    // Lấy dữ liệu
    request.input('offset', offset);
    request.input('limit', limit);
    
    const result = await request.query(`
      SELECT id, title, description, genre, category, year, duration,
             country, language, rating, rating_count, poster_url,
             trailer_url, is_hot, views
      FROM movies 
      ${whereClause}
      ORDER BY is_hot DESC, views DESC, created_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    res.json({
      success: true,
      data: result.recordset,
      pagination: {
        page, limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ================================================
// GET /api/movies/trending – Phim đang hot
// ================================================
router.get('/trending', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 8 id, title, genre, category, year, rating, poster_url, is_hot, views
      FROM movies
      WHERE is_active = 1 AND is_hot = 1
      ORDER BY views DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ================================================
// GET /api/movies/search?q=keyword – Tìm kiếm phim
// ================================================
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Từ khoá tìm kiếm phải có ít nhất 2 ký tự.'
      });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('keyword', `%${q.trim()}%`)
      .query(`
        SELECT TOP 20 id, title, genre, category, year, rating, poster_url, views
        FROM movies
        WHERE is_active = 1 AND (title LIKE @keyword OR description LIKE @keyword OR genre LIKE @keyword)
        ORDER BY views DESC
      `);

    res.json({ success: true, data: result.recordset, keyword: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// ================================================
// GET /api/movies/:id – Chi tiết 1 phim
// ================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    
    const movieResult = await pool.request()
      .input('id', id)
      .query(`SELECT * FROM movies WHERE id = @id AND is_active = 1`);

    if (movieResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim này.'
      });
    }

    // Tăng lượt xem
    await pool.request().input('id', id).query(`UPDATE movies SET views = views + 1 WHERE id = @id`);

    // Lấy đánh giá mới nhất
    const reviewsResult = await pool.request()
      .input('id', id)
      .query(`
        SELECT TOP 5 r.rating, r.comment, r.created_at, u.full_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.movie_id = @id
        ORDER BY r.created_at DESC
      `);

    res.json({
      success: true,
      data: { ...movieResult.recordset[0], reviews: reviewsResult.recordset }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
