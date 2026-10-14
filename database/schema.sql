-- ============================================================
-- database/schema.sql
-- Gloriosa AI — MySQL Database Schema
--
-- Run this file to initialize the database manually:
--   mysql -u root -p < database/schema.sql
--
-- OR let SQLAlchemy auto-create tables on first server startup.
-- ============================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS gloriosa_ai
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gloriosa_ai;

-- ── Users Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              INT             NOT NULL AUTO_INCREMENT,
    phone_number    VARCHAR(20)     NOT NULL,
    language        VARCHAR(5)      NOT NULL DEFAULT 'ta',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login      DATETIME        NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_phone (phone_number),

    -- Index for fast phone number lookup during login
    INDEX idx_users_phone (phone_number),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ── Analyses Table ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
    id                  INT             NOT NULL AUTO_INCREMENT,
    user_id             INT             NOT NULL,
    image_path          VARCHAR(512)    NOT NULL,

    -- Crop validation result
    is_gloriosa         TINYINT(1)      NOT NULL DEFAULT 0,

    -- Disease prediction result
    disease_detected    TINYINT(1)      NOT NULL DEFAULT 0,
    disease_name        VARCHAR(255)    NULL,
    severity            VARCHAR(50)     NULL
                        COMMENT 'Healthy | Mild | Moderate | Severe',
    confidence          FLOAT           NULL
                        COMMENT '0.0 to 1.0',

    -- Recommendations stored as JSON array
    recommendations_json TEXT           NULL,

    -- Timestamp
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    -- Foreign key to users
    CONSTRAINT fk_analyses_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    -- Indexes for frequent queries
    INDEX idx_analyses_user_id      (user_id),
    INDEX idx_analyses_created_at   (created_at),
    INDEX idx_analyses_user_date    (user_id, created_at DESC),
    INDEX idx_analyses_severity     (severity),
    INDEX idx_analyses_disease_name (disease_name)

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- ── Views for Statistics ──────────────────────────────────────
-- These views are optional — the application computes stats in Python.
-- Useful for direct SQL analytics.

CREATE OR REPLACE VIEW v_statistics_overview AS
SELECT
    (SELECT COUNT(*) FROM users)                                       AS total_users,
    (SELECT COUNT(*) FROM analyses)                                    AS total_analyses,
    (SELECT COUNT(*) FROM analyses WHERE is_gloriosa = 1)              AS valid_gloriosa_count,
    (SELECT COUNT(*) FROM analyses WHERE is_gloriosa = 0)              AS invalid_crop_count,
    (SELECT COUNT(*) FROM analyses WHERE severity = 'Healthy')         AS healthy_count,
    (SELECT COUNT(*) FROM analyses WHERE disease_detected = 1)         AS disease_detected_count,
    (SELECT COUNT(*) FROM analyses WHERE severity = 'Mild')            AS mild_count,
    (SELECT COUNT(*) FROM analyses WHERE severity = 'Moderate')        AS moderate_count,
    (SELECT COUNT(*) FROM analyses WHERE severity = 'Severe')          AS severe_count;


CREATE OR REPLACE VIEW v_daily_analyses AS
SELECT
    DATE(created_at)        AS date,
    COUNT(*)                AS analysis_count
FROM analyses
GROUP BY DATE(created_at)
ORDER BY date DESC;


CREATE OR REPLACE VIEW v_disease_distribution AS
SELECT
    disease_name,
    COUNT(*)                AS count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM analyses WHERE disease_detected = 1), 1) AS percentage
FROM analyses
WHERE disease_detected = 1 AND disease_name IS NOT NULL
GROUP BY disease_name
ORDER BY count DESC;


-- ── Sample Data (for testing) ─────────────────────────────────
-- Uncomment to insert test data:

-- INSERT INTO users (phone_number, language) VALUES
-- ('9876543210', 'ta'),
-- ('9876543211', 'en');
