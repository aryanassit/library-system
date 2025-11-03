const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { requireAdmin } = require("./auth");

router.get("/", (req, res) => {
  const { search, status, sortBy, sortOrder, includeDeleted } = req.query;

  let query = "SELECT * FROM books";
  let params = [];
  let conditions = [];

  if (search) {
    conditions.push("(title LIKE ? OR author LIKE ? OR isbn LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status && status !== "all") {
    conditions.push("status = ?");
    params.push(status);
  }

  // Only show non-deleted books unless explicitly requested
  if (includeDeleted !== "true") {
    conditions.push("is_deleted = FALSE");
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  if (sortBy) {
    const order = sortOrder === "desc" ? "DESC" : "ASC";
    query += ` ORDER BY ${sortBy} ${order}`;
  } else {
    query += " ORDER BY created_at DESC";
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error fetching books:", err);
      return res.status(500).json({ error: "Failed to fetch books" });
    }
    res.json(rows);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM books WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error fetching book:", err);
      return res.status(500).json({ error: "Failed to fetch book" });
    }
    if (!row) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(row);
  });
});

router.post("/", (req, res) => {
  const { title, author, isbn, genre, publication_year, description, status } =
    req.body;

  if (!title || !author || !isbn) {
    return res
      .status(400)
      .json({ error: "Title, author, and ISBN are required" });
  }

  const query = `INSERT INTO books (title, author, isbn, genre, publication_year, description, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    title,
    author,
    isbn,
    genre,
    publication_year,
    description,
    status || "available",
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Error creating book:", err);
      return res.status(500).json({ error: "Failed to create book" });
    }

    db.run("INSERT INTO activities (description) VALUES (?)", [
      `New book added: ${title} by ${author}`,
    ]);

    // Create notification for book import/addition
    const notificationsDb = require("../database/submissions_db");
    notificationsDb.run("INSERT INTO notifications (type, message, related_id) VALUES (?, ?, ?)", [
      "book_added",
      `New book "${title}" by ${author} has been added to the library.`,
      this.lastID
    ]);

    res
      .status(201)
      .json({ id: this.lastID, message: "Book created successfully" });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, genre, publication_year, description, status } =
    req.body;

  const query = `UPDATE books SET title = ?, author = ?, isbn = ?, genre = ?,
                  publication_year = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`;
  const params = [
    title,
    author,
    isbn,
    genre,
    publication_year,
    description,
    status,
    id,
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Error updating book:", err);
      return res.status(500).json({ error: "Failed to update book" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book updated successfully" });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const { permanent } = req.query; // Check if permanent deletion is requested

  db.get("SELECT title, author, is_deleted FROM books WHERE id = ?", [id], (err, book) => {
    if (err) {
      console.error("Error fetching book for deletion:", err);
      return res.status(500).json({ error: "Failed to delete book" });
    }

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (permanent === "true") {
      // Permanent deletion
      db.run("DELETE FROM books WHERE id = ?", [id], function (err) {
        if (err) {
          console.error("Error permanently deleting book:", err);
          return res.status(500).json({ error: "Failed to permanently delete book" });
        }

        db.run("INSERT INTO activities (description) VALUES (?)", [
          `Book permanently deleted: ${book.title} by ${book.author}`,
        ]);

        res.json({ message: "Book permanently deleted successfully" });
      });
    } else {
      // Soft delete
      db.run("UPDATE books SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [id], function (err) {
        if (err) {
          console.error("Error soft deleting book:", err);
          return res.status(500).json({ error: "Failed to delete book" });
        }

        db.run("INSERT INTO activities (description) VALUES (?)", [
          `Book moved to trash: ${book.title} by ${book.author}`,
        ]);

        res.json({ message: "Book moved to trash successfully" });
      });
    }
  });
});

router.delete("/", requireAdmin, (req, res) => {
  db.run("DELETE FROM books", function (err) {
    if (err) {
      console.error("Error deleting all books:", err);
      return res.status(500).json({ error: "Failed to delete all books" });
    }

    db.run("INSERT INTO activities (description) VALUES (?)", [
      "All books removed",
    ]);

    res.json({ message: "All books deleted successfully" });
  });
});

router.get("/borrowed", (req, res) => {
  // Assuming user_id is available from session or auth middleware
  const userId = req.session.userId; // Adjust based on your auth setup

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const query = `
    SELECT b.*, br.borrow_date, br.due_date, br.return_date, br.status as borrow_status
    FROM borrowings br
    JOIN books b ON br.book_id = b.id
    WHERE br.user_id = ? AND br.status = 'active'
    ORDER BY br.borrow_date DESC
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching borrowed books:", err);
      return res.status(500).json({ error: "Failed to fetch borrowed books" });
    }
    res.json(rows);
  });
});

router.post("/:id/borrow", (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId; // Adjust based on your auth setup

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  // Check if book is available
  db.get("SELECT * FROM books WHERE id = ? AND status = 'available'", [id], (err, book) => {
    if (err) {
      console.error("Error checking book availability:", err);
      return res.status(500).json({ error: "Failed to borrow book" });
    }

    if (!book) {
      return res.status(400).json({ error: "Book is not available for borrowing" });
    }

    // Check if user already has this book borrowed
    db.get("SELECT * FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'active'", [userId, id], (err, existingBorrow) => {
      if (err) {
        console.error("Error checking existing borrow:", err);
        return res.status(500).json({ error: "Failed to borrow book" });
      }

      if (existingBorrow) {
        return res.status(400).json({ error: "You have already borrowed this book" });
      }

      // Calculate due date (14 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      // Insert borrowing record
      const borrowQuery = "INSERT INTO borrowings (user_id, book_id, due_date) VALUES (?, ?, ?)";
      db.run(borrowQuery, [userId, id, dueDate.toISOString()], function (err) {
        if (err) {
          console.error("Error creating borrowing record:", err);
          return res.status(500).json({ error: "Failed to borrow book" });
        }

        // Update book status
        db.run("UPDATE books SET status = 'borrowed' WHERE id = ?", [id], (err) => {
          if (err) {
            console.error("Error updating book status:", err);
            return res.status(500).json({ error: "Failed to borrow book" });
          }

          // Add activity
          db.run("INSERT INTO activities (description, user_id) VALUES (?, ?)", [
            `Book "${book.title}" borrowed by user`,
            userId
          ]);

          res.json({ message: "Book borrowed successfully" });
        });
      });
    });
  });
});

router.post("/:id/return", (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId; // Adjust based on your auth setup

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  // Find active borrowing record
  db.get("SELECT * FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'active'", [userId, id], (err, borrowing) => {
    if (err) {
      console.error("Error finding borrowing record:", err);
      return res.status(500).json({ error: "Failed to return book" });
    }

    if (!borrowing) {
      return res.status(400).json({ error: "No active borrowing record found for this book" });
    }

    // Update borrowing record
    db.run("UPDATE borrowings SET status = 'returned', return_date = CURRENT_TIMESTAMP WHERE id = ?", [borrowing.id], (err) => {
      if (err) {
        console.error("Error updating borrowing record:", err);
        return res.status(500).json({ error: "Failed to return book" });
      }

      // Update book status
      db.run("UPDATE books SET status = 'available' WHERE id = ?", [id], (err) => {
        if (err) {
          console.error("Error updating book status:", err);
          return res.status(500).json({ error: "Failed to return book" });
        }

        // Add activity
        db.get("SELECT title FROM books WHERE id = ?", [id], (err, book) => {
          if (!err && book) {
            db.run("INSERT INTO activities (description, user_id) VALUES (?, ?)", [
              `Book "${book.title}" returned by user`,
              userId
            ]);
          }
        });

        res.json({ message: "Book returned successfully" });
      });
    });
  });
});

// Add restore endpoint
router.post("/:id/restore", (req, res) => {
  const { id } = req.params;

  db.run("UPDATE books SET is_deleted = FALSE, deleted_at = NULL WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error restoring book:", err);
      return res.status(500).json({ error: "Failed to restore book" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    db.get("SELECT title, author FROM books WHERE id = ?", [id], (err, book) => {
      if (!err && book) {
        db.run("INSERT INTO activities (description) VALUES (?)", [
          `Book restored: ${book.title} by ${book.author}`,
        ]);
      }
    });

    res.json({ message: "Book restored successfully" });
  });
});

module.exports = router;
