-- ================================================
-- CinéVibe Database Schema (SQL Server / T-SQL)
-- ================================================

IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'cinevibe_db')
BEGIN
    CREATE DATABASE cinevibe_db;
END
GO

USE cinevibe_db;
GO

-- ================================================
-- BẢNG NGƯỜI DÙNG
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id           INT IDENTITY(1,1) PRIMARY KEY,
        full_name    NVARCHAR(100) NOT NULL,
        email        VARCHAR(150) UNIQUE NOT NULL,
        password     VARCHAR(255) NOT NULL,
        phone        VARCHAR(20),
        avatar_url   VARCHAR(500),
        role         VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_active    BIT DEFAULT 1,
        created_at   DATETIME DEFAULT GETDATE(),
        updated_at   DATETIME DEFAULT GETDATE()
    );
END
GO

-- ================================================
-- BẢNG PHIM
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'movies')
BEGIN
    CREATE TABLE movies (
        id           INT IDENTITY(1,1) PRIMARY KEY,
        title        NVARCHAR(255) NOT NULL,
        description  NVARCHAR(MAX),
        genre        NVARCHAR(100),
        category     VARCHAR(20) DEFAULT 'cinema' CHECK (category IN ('cinema', 'series', 'long_series')),
        year         INT,
        duration     INT,                     
        country      NVARCHAR(100),
        language     NVARCHAR(100) DEFAULT N'Tiếng Việt',
        rating       DECIMAL(3,1) DEFAULT 0,  
        rating_count INT DEFAULT 0,
        poster_url   VARCHAR(500),            
        trailer_url  VARCHAR(500),            
        video_url    VARCHAR(500),            
        is_hot       BIT DEFAULT 0,  
        is_active    BIT DEFAULT 1,
        views        INT DEFAULT 0,
        created_at   DATETIME DEFAULT GETDATE()
    );
END
GO

-- ================================================
-- BẢNG GÓI ĐĂNG KÝ
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'subscription_plans')
BEGIN
    CREATE TABLE subscription_plans (
        id            INT IDENTITY(1,1) PRIMARY KEY,
        name          NVARCHAR(100) NOT NULL,
        plan_type     VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
        price         DECIMAL(18,0) NOT NULL,  
        duration_days INT NOT NULL,           
        max_screens   INT DEFAULT 2,
        quality       VARCHAR(20) DEFAULT 'HD',
        can_download  BIT DEFAULT 0,
        description   NVARCHAR(MAX),
        is_active     BIT DEFAULT 1
    );
END
GO

-- ================================================
-- BẢNG ĐĂNG KÝ CỦA USER
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'subscriptions')
BEGIN
    CREATE TABLE subscriptions (
        id           INT IDENTITY(1,1) PRIMARY KEY,
        user_id      INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
        plan_id      INT NOT NULL FOREIGN KEY REFERENCES subscription_plans(id),
        start_date   DATE NOT NULL,
        end_date     DATE NOT NULL,
        status       VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
        created_at   DATETIME DEFAULT GETDATE()
    );
END
GO

-- ================================================
-- BẢNG LỊCH SỬ XEM
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'watch_history')
BEGIN
    CREATE TABLE watch_history (
        id              INT IDENTITY(1,1) PRIMARY KEY,
        user_id         INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
        movie_id        INT NOT NULL FOREIGN KEY REFERENCES movies(id) ON DELETE CASCADE,
        progress_sec    INT DEFAULT 0,   
        completed       BIT DEFAULT 0,
        last_watched_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT unique_user_movie UNIQUE (user_id, movie_id)
    );
END
GO

-- ================================================
-- BẢNG YÊU THÍCH
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'watchlist')
BEGIN
    CREATE TABLE watchlist (
        id         INT IDENTITY(1,1) PRIMARY KEY,
        user_id    INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
        movie_id   INT NOT NULL FOREIGN KEY REFERENCES movies(id) ON DELETE CASCADE,
        added_at   DATETIME DEFAULT GETDATE(),
        CONSTRAINT unique_watchlist UNIQUE (user_id, movie_id)
    );
END
GO

-- ================================================
-- BẢNG ĐÁNH GIÁ
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'reviews')
BEGIN
    CREATE TABLE reviews (
        id         INT IDENTITY(1,1) PRIMARY KEY,
        user_id    INT NOT NULL FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
        movie_id   INT NOT NULL FOREIGN KEY REFERENCES movies(id) ON DELETE CASCADE,
        rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 10),
        comment    NVARCHAR(MAX),
        created_at DATETIME DEFAULT GETDATE(),
        CONSTRAINT unique_review UNIQUE (user_id, movie_id)
    );
END
GO

-- ================================================
-- BẢNG THANH TOÁN
-- ================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'payments')
BEGIN
    CREATE TABLE payments (
        id             INT IDENTITY(1,1) PRIMARY KEY,
        user_id        INT NOT NULL FOREIGN KEY REFERENCES users(id),
        plan_id        INT NOT NULL,
        amount         DECIMAL(18,0) NOT NULL,
        method         VARCHAR(20) NOT NULL CHECK (method IN ('momo', 'vnpay', 'banking', 'visa')),
        status         VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
        transaction_id VARCHAR(255),
        created_at     DATETIME DEFAULT GETDATE()
    );
END
GO

-- ================================================
-- DỮ LIỆU MẪU
-- ================================================

-- Gói đăng ký
IF NOT EXISTS (SELECT * FROM subscription_plans)
BEGIN
    INSERT INTO subscription_plans (name, plan_type, price, duration_days, max_screens, quality, can_download, description) VALUES
    (N'Gói Tháng', 'monthly', 49000, 30,  2, 'HD',  0, N'Full HD 1080p, 2 màn hình đồng thời, không quảng cáo'),
    (N'Gói Năm',   'yearly',  399000, 365, 4, '4K',  1, N'4K Ultra HD + Dolby, 4 màn hình, tải về offline');
END
GO

-- Phim mẫu
IF NOT EXISTS (SELECT * FROM movies)
BEGIN
    INSERT INTO movies (title, description, genre, category, year, duration, country, language, rating, poster_url, is_hot, views) VALUES
    (N'Bóng Đêm Vô Cực',   N'Một thám tử ưu tú điều tra vụ án bí ẩn trong đêm khuya thành phố.', N'Hành động', 'cinema',       2025, 120, N'Mỹ',       N'Vietsub',     9.2, 'https://placehold.co/300x450/1a1f30/1E90FF?text=Bong+Dem', 1, 150000),
    (N'Tình Yêu Giữa Núi', N'Chuyện tình lãng mạn giữa đôi trẻ ở vùng núi Tây Bắc thơ mộng.',  N'Tình cảm', 'cinema',       2025, 105, N'Việt Nam', N'Tiếng Việt',  8.7, 'https://placehold.co/300x450/1a1f30/FFD700?text=Tinh+Yeu', 1, 98000),
    (N'Vũ Trụ Vô Tận',     N'Hành trình khám phá vũ trụ của phi hành đoàn trong tương lai xa.',   N'Sci-fi',   'cinema',       2025, 140, N'Mỹ',       N'Vietsub',     9.5, 'https://placehold.co/300x450/1a1f30/A855F7?text=Vu+Tru',   1, 220000),
    (N'Ký Ức Phôi Phai',   N'Bộ phim tâm lý xúc động về ký ức và sự mất mát trong gia đình.',   N'Tâm lý',   'cinema',       2025,  95, N'Hàn Quốc', N'Vietsub',     8.4, 'https://placehold.co/300x450/1a1f30/FF6B6B?text=Ky+Uc',    0, 67000),
    (N'Hào Môn Thế Gia',   N'Series tình cảm về cuộc sống hào nhoáng và bí mật trong gia tộc.', N'Tình cảm', 'series',        2025,  45, N'Trung Quốc',N'Vietsub',    8.1, 'https://placehold.co/300x450/1a1f30/FF9500?text=Hao+Mon',  1, 310000),
    (N'Làng Nghề Xưa',     N'Phim dài tập về cuộc sống giản dị, ấm áp tại làng nghề truyền thống.',N'Gia đình','long_series', 2024,  50, N'Việt Nam', N'Tiếng Việt',  7.9, 'https://placehold.co/300x450/1a1f30/4ade80?text=Lang+Nghe', 0, 45000);
END
GO
