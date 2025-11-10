const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "library.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    initializeDatabase();
  }
});

function initializeDatabase() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  db.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='books'",
    (err, row) => {
      if (err) {
        console.error("Error checking database:", err.message);
        return;
      }

      if (row) {
        console.log("Database already initialized.");
      } else {
        db.exec(schema, (err) => {
          if (err) {
            console.error("Error initializing database:", err.message);
          } else {
            console.log("Database initialized successfully.");
          }
        });
      }
    }
  );
}

module.exports = db;
