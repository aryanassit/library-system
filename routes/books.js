const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET all books
router.get('/', (req, res) => {
  const { search, status, sortBy, sortOrder } = req.query;

  let query = 'SELECT * FROM books';
  let params = [];
  let conditions = [];

  if (search) {
    conditions.push('(title LIKE ? OR author LIKE ? OR isbn LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status && status !== 'all') {
    conditions.push('status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  if (sortBy) {
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortBy} ${order}`;
  } else {
    query += ' ORDER BY created_at DESC';
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Failed to fetch books' });
    }
    res.json(rows);
  });
});

// GET book by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching book:', err);
      return res.status(500).json({ error: 'Failed to fetch book' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(row);
  });
});

// POST new book
router.post('/', (req, res) => {
  const { title, author, isbn, genre, publication_year, description, status } = req.body;

  if (!title || !author || !isbn) {
    return res.status(400).json({ error: 'Title, author, and ISBN are required' });
  }

  const query = `INSERT INTO books (title, author, isbn, genre, publication_year, description, status)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [title, author, isbn, genre, publication_year, description, status || 'available'];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error creating book:', err);
      return res.status(500).json({ error: 'Failed to create book' });
    }

    // Add activity
    db.run('INSERT INTO activities (description) VALUES (?)',
           [`New book added: ${title} by ${author}`]);

    res.status(201).json({ id: this.lastID, message: 'Book created successfully' });
  });
});

// PUT update book
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, genre, publication_year, description, status } = req.body;

  const query = `UPDATE books SET title = ?, author = ?, isbn = ?, genre = ?,
                  publication_year = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                  WHERE id = ?`;
  const params = [title, author, isbn, genre, publication_year, description, status, id];

  db.run(query, params, function(err) {
    if (err) {
      console.error('Error updating book:', err);
      return res.status(500).json({ error: 'Failed to update book' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book updated successfully' });
  });
});

// DELETE book
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  // Get book info for activity log
  db.get('SELECT title, author FROM books WHERE id = ?', [id], (err, book) => {
    if (err) {
      console.error('Error fetching book for deletion:', err);
      return res.status(500).json({ error: 'Failed to delete book' });
    }

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting book:', err);
        return res.status(500).json({ error: 'Failed to delete book' });
      }

      // Add activity
      db.run('INSERT INTO activities (description) VALUES (?)',
             [`Book deleted: ${book.title} by ${book.author}`]);

      res.json({ message: 'Book deleted successfully' });
    });
  });
});

module.exports = router;
