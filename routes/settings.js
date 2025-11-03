const express = require("express");
const router = express.Router();
const db = require("../database/db");

router.get("/", (req, res) => {
  db.all("SELECT * FROM settings", (err, rows) => {
    if (err) {
      console.error("Error fetching settings:", err);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });
});

router.put("/", (req, res) => {
  const { maintenanceMode, emailNotifications, maxBorrowDays, maxBooksPerUser } = req.body;
  const updates = [
    { key: 'maintenance_mode', value: maintenanceMode ? 'true' : 'false' },
    { key: 'email_notifications', value: emailNotifications ? 'true' : 'false' },
    { key: 'max_borrow_days', value: maxBorrowDays.toString() },
    { key: 'max_books_per_user', value: maxBooksPerUser.toString() }
  ];

  let completed = 0;
  updates.forEach(update => {
    db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [update.key, update.value], (err) => {
      if (err) {
        console.error("Error updating setting:", err);
        return res.status(500).json({ error: "Failed to update settings" });
      }
      completed++;
      if (completed === updates.length) {
        res.json({ message: "Settings updated successfully" });
      }
    });
  });
});

router.delete("/", (req, res) => {
  db.run("DELETE FROM settings", function (err) {
    if (err) {
      console.error("Error deleting settings:", err);
      return res.status(500).json({ error: "Failed to delete settings" });
    }
    res.json({ message: "All settings deleted" });
  });
});

module.exports = router;
