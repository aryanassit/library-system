-- Library Management System Database Schema
-- This schema defines tables for books, users, activities, and settings.
-- Create Books table
CREATE TABLE
    books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT UNIQUE NOT NULL,
        genre TEXT,
        publication_year INTEGER,
        description TEXT,
        status TEXT DEFAULT 'available' CHECK (status IN ('available', 'borrowed', 'unavailable', 'removed')),
        cover_image TEXT,
        book_link TEXT,
        quantity INTEGER DEFAULT 1,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Create Users table
CREATE TABLE
    users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        verification_code TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Create Activities table (stores up to 50 recent activities)
CREATE TABLE
    activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

-- Create Borrowings table to track book loans
CREATE TABLE
    borrowings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        due_date DATETIME,
        return_date DATETIME,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
    );

-- Create Settings table for general application settings
CREATE TABLE
    settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

-- Indexes for performance
CREATE INDEX idx_books_title ON books (title);

CREATE INDEX idx_books_author ON books (author);

CREATE INDEX idx_books_status ON books (status);

CREATE INDEX idx_books_isbn ON books (isbn);

CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_users_status ON users (status);

CREATE INDEX idx_activities_timestamp ON activities (timestamp);

CREATE INDEX idx_activities_user_id ON activities (user_id);

CREATE INDEX idx_settings_key ON settings (key);

-- Sample data inserts based on dashboard content
-- Insert sample activities (recent ones)
INSERT INTO
    activities (description, user_id)
VALUES
    (
        'New book added: The Great Gatsby by F. Scott Fitzgerald',
        2
    ),
    (
        'New user registered: John Doe (john.doe@example.com)',
        2
    ),
    ('Book "1984" borrowed', 1),
    ('System backup completed', NULL),
    (
        'New user registered: Jane Smith (jane.smith@example.com)',
        2
    );

-- Insert sample settings
INSERT INTO
    settings (key, value)
VALUES
    ('maintenance_mode', 'false'),
    ('email_notifications', 'true'),
    ('max_borrow_days', '14'),
    ('max_books_per_user', '5');

-- Trigger to update updated_at on row changes
CREATE TRIGGER update_books_updated_at AFTER
UPDATE ON books BEGIN
UPDATE books
SET
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = NEW.id;

END;

CREATE TRIGGER update_users_updated_at AFTER
UPDATE ON users BEGIN
UPDATE users
SET
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = NEW.id;

END;

CREATE TRIGGER update_settings_updated_at AFTER
UPDATE ON settings BEGIN
UPDATE settings
SET
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = NEW.id;

END;

-- Trigger to limit activities to 50 most recent
CREATE TRIGGER limit_activities AFTER INSERT ON activities BEGIN
DELETE FROM activities
WHERE
    id NOT IN (
        SELECT
            id
        FROM
            activities
        ORDER BY
            timestamp DESC
        LIMIT
            50
    );

END;