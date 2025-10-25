const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Session middleware
app.use(session({
  secret: 'your-secret-key', // In production, use a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

const db = require("./database/db");
const submissionsDb = require("./database/submissions_db");

app.use("/api/books", require("./routes/books"));
app.use("/api/users", require("./routes/users"));
app.use("/api/activities", require("./routes/activities"));
app.use("/api/settings", require("./routes/settings"));
app.use("/api/auth", require("./routes/auth").router);
app.use("/api/submissions", require("./routes/submissions"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Library Management System API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed.");
    }
    process.exit(0);
  });
});

module.exports = db;
