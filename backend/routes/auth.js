// routes/auth.js – Đăng ký & Đăng nhập
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { poolPromise } = require('../config/db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ: họ tên, email, mật khẩu.' });
    }

    const pool = await poolPromise;
    
    // Kiểm tra email
    const existing = await pool.request().input('email', email).query('SELECT id FROM users WHERE email = @email');
    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL Server uses output inserted.id instead of insertId
    const result = await pool.request()
      .input('full_name', full_name)
      .input('email', email)
      .input('password', hashedPassword)
      .input('phone', phone || null)
      .query(`
        INSERT INTO users (full_name, email, password, phone) 
        OUTPUT inserted.id 
        VALUES (@full_name, @email, @password, @phone)
      `);

    const newUserId = result.recordset[0].id;

    const token = jwt.sign(
      { id: newUserId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Chào mừng đến với CinéVibe 🎬',
      token,
      user: { id: newUserId, full_name, email, role: 'user' }
    });

  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu.' });
    }

    const pool = await poolPromise;
    const result = await pool.request().input('email', email).query('SELECT * FROM users WHERE email = @email');
    
    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const user = result.recordset[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khoá.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: `Chào mừng trở lại, ${user.full_name}! 🎬`,
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url }
    });

  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
