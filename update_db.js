const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/library.db');

db.run(`PRAGMA foreign_keys = OFF;`, () => {
  db.run(`CREATE TABLE books_temp (
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
  )`, () => {
    db.run(`INSERT INTO books_temp SELECT * FROM books`, () => {
      db.run(`DROP TABLE books`, () => {
        db.run(`ALTER TABLE books_temp RENAME TO books`, () => {
          db.run(`PRAGMA foreign_keys = ON;`, () => {
            console.log('Status constraint updated successfully');
            db.close();
          });
        });
      });
    });
  });
});
