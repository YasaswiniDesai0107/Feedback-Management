-- ============================================================
-- MySQL Schema Setup Script
-- Feedback Management System — Phase 1
-- ============================================================
-- Run this script once to set up the database and table.
-- Usage: mysql -u root -p < schema.sql
-- ============================================================

-- Step 1: Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS feedback_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Step 2: Select the database
USE feedback_db;

-- Step 3: Create the feedbacks table
-- Note: SQLAlchemy will auto-create this on app startup too.
--       This script is useful for manual setup or CI/CD pipelines.
CREATE TABLE IF NOT EXISTS feedbacks (
    feedback_id      INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each feedback entry',
    participant_name VARCHAR(150)  NOT NULL             COMMENT 'Full name of the participant submitting feedback',
    program_name     VARCHAR(200)  NOT NULL             COMMENT 'Name of the program or course being reviewed',
    rating           INT           NOT NULL             COMMENT 'Rating from 1 (poor) to 5 (excellent)',
    comments         TEXT                               COMMENT 'Optional free-text comments or suggestions',
    submitted_at     DATETIME      NOT NULL DEFAULT NOW() COMMENT 'Timestamp when the feedback was submitted',

    -- Enforce valid rating range at the database level
    CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Stores academic program feedback submissions';

-- Step 4: Verify the table was created successfully
DESCRIBE feedbacks;

-- ============================================================
-- Sample Test Data (optional — remove before production)
-- ============================================================
INSERT INTO feedbacks (participant_name, program_name, rating, comments) VALUES
    ('Alice Johnson',  'Data Science Bootcamp',      5, 'Excellent hands-on curriculum!'),
    ('Bob Smith',      'Web Development Fundamentals', 4, 'Very practical and well-paced.'),
    ('Carol White',    'Machine Learning Essentials', 3, 'Good content but needs more examples.'),
    ('David Brown',    'Cloud Computing 101',         5, 'Outstanding instructor and material.'),
    ('Eva Martinez',   'Cybersecurity Basics',        2, 'Too theoretical, needs lab sessions.');

-- Verify sample data
SELECT * FROM feedbacks;
