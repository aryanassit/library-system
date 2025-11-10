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

// Helper function to validate ISBN
function isValidISBN(isbn) {
  // Remove hyphens and spaces
  isbn = isbn.replace(/[-\s]/g, '');

  if (isbn.length === 10) {
    // ISBN-10 validation
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }
    let checkDigit = isbn[9];
    if (checkDigit === 'X') checkDigit = 10;
    else checkDigit = parseInt(checkDigit);
    sum += checkDigit;
    return sum % 11 === 0;
  } else if (isbn.length === 13) {
    // ISBN-13 validation
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    let checkDigit = (10 - (sum % 10)) % 10;
    return parseInt(isbn[12]) === checkDigit;
  }
  return false;
}

router.post("/", (req, res) => {
  const { title, author, isbn, genre, publication_year, description, status } =
    req.body;

  // Trim and validate required fields
  const trimmedTitle = title?.trim();
  const trimmedAuthor = author?.trim();
  const trimmedIsbn = isbn?.trim();

  if (!trimmedTitle || !trimmedAuthor || !trimmedIsbn) {
    return res
      .status(400)
      .json({ error: "Title, author, and ISBN are required and cannot be empty" });
  }

  // Validate ISBN format
  if (!isValidISBN(trimmedIsbn)) {
    return res.status(400).json({ error: "Invalid ISBN format" });
  }

  // Validate publication_year
  const currentYear = new Date().getFullYear();
  if (publication_year !== undefined && publication_year !== null) {
    const year = parseInt(publication_year);
    if (isNaN(year) || year < 1000 || year > currentYear) {
      return res.status(400).json({ error: "Publication year must be a valid integer between 1000 and current year" });
    }
  }

  // Validate status
  const allowedStatuses = ['available', 'borrowed', 'unavailable', 'removed'];
  const bookStatus = status || 'available';
  if (!allowedStatuses.includes(bookStatus)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  // Check ISBN uniqueness
  db.get("SELECT id FROM books WHERE isbn = ? AND is_deleted = FALSE", [trimmedIsbn], (err, row) => {
    if (err) {
      console.error("Error checking ISBN uniqueness:", err);
      return res.status(500).json({ error: "Failed to validate book" });
    }
    if (row) {
      return res.status(400).json({ error: "ISBN already exists" });
    }

    // Proceed with insertion
    const query = `INSERT INTO books (title, author, isbn, genre, publication_year, description, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      trimmedTitle,
      trimmedAuthor,
      trimmedIsbn,
      genre?.trim() || null,
      publication_year,
      description?.trim() || null,
      bookStatus,
    ];

    db.run(query, params, function (err) {
      if (err) {
        console.error("Error creating book:", err);
        return res.status(500).json({ error: "Failed to create book" });
      }

      db.run("INSERT INTO activities (description) VALUES (?)", [
        `New book added: ${trimmedTitle} by ${trimmedAuthor}`,
      ]);

      const notificationsDb = require("../database/submissions_db");
      notificationsDb.run(
        "INSERT INTO notifications (type, message, related_id) VALUES (?, ?, ?)",
        [
          "book_added",
          `New book "${trimmedTitle}" by ${trimmedAuthor} has been added to the library.`,
          this.lastID,
        ]
      );

      res
        .status(201)
        .json({ id: this.lastID, message: "Book created successfully" });
    });
  });
});

router.post("/import", (req, res) => {
  const { books } = req.body;

  if (!Array.isArray(books)) {
    return res.status(400).json({ error: "Books must be an array" });
  }

  let addedCount = 0;
  let errors = [];

  books.forEach((bookData, index) => {
    if (bookData.title && bookData.author) {
      const query = `INSERT INTO books (title, author, isbn, genre, publication_year, description, status)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const params = [
        bookData.title,
        bookData.author,
        bookData.isbn || "",
        bookData.genre || "",
        bookData.publication_year || null,
        bookData.description || "",
        bookData.status || "available",
      ];

      db.run(query, params, function (err) {
        if (err) {
          errors.push(`Book ${index + 1}: ${err.message}`);
        } else {
          addedCount++;
        }
      });
    } else {
      errors.push(`Book ${index + 1}: Missing title or author`);
    }
  });

  setTimeout(() => {
    if (addedCount > 0) {
      db.run("INSERT INTO activities (description) VALUES (?)", [
        `Bulk import: ${addedCount} books imported`,
      ]);

      const notificationsDb = require("../database/submissions_db");
      notificationsDb.run(
        "INSERT INTO notifications (type, message) VALUES (?, ?)",
        [
          "bulk_import",
          `${addedCount} books have been imported in bulk.`,
        ]
      );
    }

    res.json({
      message: `Imported ${addedCount} books successfully`,
      addedCount,
      errors,
    });
  }, 100); // Small delay to allow async operations
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
  const { permanent } = req.query;

  db.get(
    "SELECT title, author, is_deleted FROM books WHERE id = ?",
    [id],
    (err, book) => {
      if (err) {
        console.error("Error fetching book for deletion:", err);
        return res.status(500).json({ error: "Failed to delete book" });
      }

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      if (permanent === "true") {
        db.run("DELETE FROM books WHERE id = ?", [id], function (err) {
          if (err) {
            console.error("Error permanently deleting book:", err);
            return res
              .status(500)
              .json({ error: "Failed to permanently delete book" });
          }

          db.run("INSERT INTO activities (description) VALUES (?)", [
            `Book permanently deleted: ${book.title} by ${book.author}`,
          ]);

          res.json({ message: "Book permanently deleted successfully" });
        });
      } else {
        db.run(
          "UPDATE books SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
          [id],
          function (err) {
            if (err) {
              console.error("Error soft deleting book:", err);
              return res.status(500).json({ error: "Failed to delete book" });
            }

            db.run("INSERT INTO activities (description) VALUES (?)", [
              `Book moved to trash: ${book.title} by ${book.author}`,
            ]);

            res.json({ message: "Book moved to trash successfully" });
          }
        );
      }
    }
  );
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
  const userId = req.session.userId;

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
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  db.get(
    "SELECT * FROM books WHERE id = ? AND status = 'available'",
    [id],
    (err, book) => {
      if (err) {
        console.error("Error checking book availability:", err);
        return res.status(500).json({ error: "Failed to borrow book" });
      }

      if (!book) {
        return res
          .status(400)
          .json({ error: "Book is not available for borrowing" });
      }

      db.get(
        "SELECT * FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'active'",
        [userId, id],
        (err, existingBorrow) => {
          if (err) {
            console.error("Error checking existing borrow:", err);
            return res.status(500).json({ error: "Failed to borrow book" });
          }

          if (existingBorrow) {
            return res
              .status(400)
              .json({ error: "You have already borrowed this book" });
          }

          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);

          const borrowQuery =
            "INSERT INTO borrowings (user_id, book_id, due_date) VALUES (?, ?, ?)";
          db.run(
            borrowQuery,
            [userId, id, dueDate.toISOString()],
            function (err) {
              if (err) {
                console.error("Error creating borrowing record:", err);
                return res.status(500).json({ error: "Failed to borrow book" });
              }

              db.run(
                "UPDATE books SET status = 'borrowed' WHERE id = ?",
                [id],
                (err) => {
                  if (err) {
                    console.error("Error updating book status:", err);
                    return res
                      .status(500)
                      .json({ error: "Failed to borrow book" });
                  }

                  db.run(
                    "INSERT INTO activities (description, user_id) VALUES (?, ?)",
                    [`Book "${book.title}" borrowed by user`, userId]
                  );

                  res.json({ message: "Book borrowed successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
});

router.post("/:id/return", (req, res) => {
  const { id } = req.params;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  db.get(
    "SELECT * FROM borrowings WHERE user_id = ? AND book_id = ? AND status = 'active'",
    [userId, id],
    (err, borrowing) => {
      if (err) {
        console.error("Error finding borrowing record:", err);
        return res.status(500).json({ error: "Failed to return book" });
      }

      if (!borrowing) {
        return res
          .status(400)
          .json({ error: "No active borrowing record found for this book" });
      }

      db.run(
        "UPDATE borrowings SET status = 'returned', return_date = CURRENT_TIMESTAMP WHERE id = ?",
        [borrowing.id],
        (err) => {
          if (err) {
            console.error("Error updating borrowing record:", err);
            return res.status(500).json({ error: "Failed to return book" });
          }

          db.run(
            "UPDATE books SET status = 'available' WHERE id = ?",
            [id],
            (err) => {
              if (err) {
                console.error("Error updating book status:", err);
                return res.status(500).json({ error: "Failed to return book" });
              }

              db.get(
                "SELECT title FROM books WHERE id = ?",
                [id],
                (err, book) => {
                  if (!err && book) {
                    db.run(
                      "INSERT INTO activities (description, user_id) VALUES (?, ?)",
                      [`Book "${book.title}" returned by user`, userId]
                    );
                  }
                }
              );

              res.json({ message: "Book returned successfully" });
            }
          );
        }
      );
    }
  );
});

router.post("/:id/restore", (req, res) => {
  const { id } = req.params;

  db.run(
    "UPDATE books SET is_deleted = FALSE, deleted_at = NULL WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        console.error("Error restoring book:", err);
        return res.status(500).json({ error: "Failed to restore book" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Book not found" });
      }

      db.get(
        "SELECT title, author FROM books WHERE id = ?",
        [id],
        (err, book) => {
          if (!err && book) {
            db.run("INSERT INTO activities (description) VALUES (?)", [
              `Book restored: ${book.title} by ${book.author}`,
            ]);
          }
        }
      );

      res.json({ message: "Book restored successfully" });
    }
  );
});

module.exports = router;
