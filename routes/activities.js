const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {
  const limit = parseInt(req.query.limit) || 50;

  db.all(
    "SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?",
    [limit],
    (err, rows) => {
      if (err) {
        console.error("Error fetching activities:", err);
        return res.status(500).json({ error: "Failed to fetch activities" });
      }
      res.json(rows);
    }
  );
});

router.post("/", (req, res) => {
  const { description, user_id } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required" });
  }

  const query = "INSERT INTO activities (description, user_id) VALUES (?, ?)";
  const params = [description, user_id || null];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Error creating activity:", err);
      return res.status(500).json({ error: "Failed to create activity" });
    }
    res
      .status(201)
      .json({ id: this.lastID, message: "Activity created successfully" });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM activities WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting activity:", err);
      return res.status(500).json({ error: "Failed to delete activity" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }
    res.json({ message: "Activity deleted successfully" });
  });
});

module.exports = router;
