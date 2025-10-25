const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/submissions.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the submissions database.");
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stars INTEGER NOT NULL,
        message TEXT,
        user TEXT,
        email TEXT,
        reply TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        related_id INTEGER,
        is_read INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Add email column if it doesn't exist
  db.run(`ALTER TABLE ratings ADD COLUMN email TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding email column:', err.message);
    }
  });
});

module.exports = db;
