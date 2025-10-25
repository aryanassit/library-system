const express = require("express");
const router = express.Router();
const db = require("../database/submissions_db");
const { requireAdmin } = require("./auth");

router.post("/rating", (req, res) => {
  const { stars, message, user, email } = req.body;
  const finalMessage = message || `${stars} star rating`;

  db.run(
    "INSERT INTO ratings (stars, message, user, email) VALUES (?, ?, ?, ?)",
    [stars, finalMessage, user, email],
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

router.get("/rating", (req, res) => {
  db.all("SELECT * FROM ratings WHERE stars > 3 ORDER BY timestamp DESC LIMIT 20", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.post("/rating/reply", (req, res) => {
  const { ratingId, reply } = req.body;

  db.run(
    "UPDATE ratings SET reply = ? WHERE id = ?",
    [reply, ratingId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Reply added successfully" });
    }
  );
});

router.delete("/ratings", requireAdmin, (req, res) => {
  db.run("DELETE FROM ratings", function (err) {
    if (err) {
      console.error("Error deleting all ratings:", err);
      return res.status(500).json({ error: "Failed to delete all ratings" });
    }
    res.json({ message: "All ratings deleted successfully" });
  });
});

router.delete("/contact", requireAdmin, (req, res) => {
  db.run("DELETE FROM contact_submissions", function (err) {
    if (err) {
      console.error("Error deleting all contact submissions:", err);
      return res.status(500).json({ error: "Failed to delete all contact submissions" });
    }
    res.json({ message: "All contact submissions deleted successfully" });
  });
});

module.exports = router;
