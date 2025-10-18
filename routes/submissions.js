const express = require("express");
const router = express.Router();
const db = require("../database/submissions_db");

router.post("/rating", (req, res) => {
  const { stars, message, user } = req.body;
  const finalMessage = message || `${stars} star rating`;

  db.run(
    "INSERT INTO ratings (stars, message, user) VALUES (?, ?, ?)",
    [stars, finalMessage, user],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Rating submitted successfully", id: this.lastID });
    }
  );
});

router.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  db.run(
    "INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        message: "Contact form submitted successfully",
        id: this.lastID,
      });
    }
  );
});

module.exports = router;
