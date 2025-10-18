const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {
  db.all("SELECT * FROM settings ORDER BY key", (err, rows) => {
    if (err) {
      console.error("Error fetching settings:", err);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }

    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    res.json(settings);
  });
});

router.get("/:key", (req, res) => {
  const { key } = req.params;
  db.get("SELECT * FROM settings WHERE key = ?", [key], (err, row) => {
    if (err) {
      console.error("Error fetching setting:", err);
      return res.status(500).json({ error: "Failed to fetch setting" });
    }
    if (!row) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json({ [row.key]: row.value });
  });
});

router.post("/", (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ error: "Key and value are required" });
  }

  const query = "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)";
  const params = [key, value];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Error creating/updating setting:", err);
      return res.status(500).json({ error: "Failed to save setting" });
    }
    res.status(201).json({ message: "Setting saved successfully" });
  });
});

router.put("/:key", (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ error: "Value is required" });
  }

  const query =
    "UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?";
  const params = [value, key];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Error updating setting:", err);
      return res.status(500).json({ error: "Failed to update setting" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json({ message: "Setting updated successfully" });
  });
});

router.delete("/:key", (req, res) => {
  const { key } = req.params;

  db.run("DELETE FROM settings WHERE key = ?", [key], function (err) {
    if (err) {
      console.error("Error deleting setting:", err);
      return res.status(500).json({ error: "Failed to delete setting" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json({ message: "Setting deleted successfully" });
  });
});

module.exports = router;
