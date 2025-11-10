CREATE TABLE
    IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stars INTEGER NOT NULL,
        message TEXT,
        user TEXT,
        email TEXT,
        reply TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );