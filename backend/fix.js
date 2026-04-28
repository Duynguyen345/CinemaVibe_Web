const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'cinevibe_db',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: { encrypt: false, trustServerCertificate: true }
};

async function fix() {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.query('DELETE FROM watch_history; DELETE FROM watchlist; DELETE FROM reviews; DELETE FROM movies; DELETE FROM subscription_plans;');
    
    await pool.query(`
      INSERT INTO subscription_plans (name, plan_type, price, duration_days, max_screens, quality, can_download, description) VALUES
      (N'Gói Tháng', 'monthly', 49000, 30,  2, 'HD',  0, N'Full HD 1080p, 2 màn hình đồng thời, không quảng cáo'),
      (N'Gói Năm',   'yearly',  399000, 365, 4, '4K',  1, N'4K Ultra HD + Dolby, 4 màn hình, tải về offline');
    `);
    
    await pool.query(`
      INSERT INTO movies (title, description, genre, category, year, duration, country, language, rating, poster_url, is_hot, views) VALUES
      (N'Bóng Đêm Vô Cực',   N'Một thám tử ưu tú điều tra vụ án bí ẩn trong đêm khuya thành phố.', N'Hành động', 'cinema',       2025, 120, N'Mỹ',       N'Vietsub',     9.2, 'images/poster1.png', 1, 150000),
      (N'Tình Yêu Giữa Núi', N'Chuyện tình lãng mạn giữa đôi trẻ ở vùng núi Tây Bắc thơ mộng.',  N'Tình cảm', 'cinema',       2025, 105, N'Việt Nam', N'Tiếng Việt',  8.7, 'images/poster2.png', 1, 98000),
      (N'Vũ Trụ Vô Tận',     N'Hành trình khám phá vũ trụ của phi hành đoàn trong tương lai xa.',   N'Sci-fi',   'cinema',       2025, 140, N'Mỹ',       N'Vietsub',     9.5, 'images/poster3.png', 1, 220000),
      (N'Ký Ức Phôi Phai',   N'Bộ phim tâm lý xúc động về ký ức và sự mất mát trong gia đình.',   N'Tâm lý',   'cinema',       2025,  95, N'Hàn Quốc', N'Vietsub',     8.4, 'images/poster1.png', 0, 67000),
      (N'Hào Môn Thế Gia',   N'Series tình cảm về cuộc sống hào nhoáng và bí mật trong gia tộc.', N'Tình cảm', 'series',        2025,  45, N'Trung Quốc',N'Vietsub',    8.1, 'images/poster2.png', 1, 310000),
      (N'Làng Nghề Xưa',     N'Phim dài tập về cuộc sống giản dị, ấm áp tại làng nghề truyền thống.',N'Gia đình','long_series', 2024,  50, N'Việt Nam', N'Tiếng Việt',  7.9, 'images/poster3.png', 0, 45000);
    `);
    console.log('Fixed Posters!');
    process.exit(0);
  } catch (err) {
    console.error(err);
  }
}
fix();
