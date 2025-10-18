const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database/db');

// Register new user
router.post('/register', async (req, res) => {
  const { name, email, password, verificationCode } = req.body;

  if (!name || !email || !password || !verificationCode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Password strength validation
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Error checking user:', err);
        return res.status(500).json({ error: 'Failed to register user' });
      }

      if (row) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const query = `INSERT INTO users (name, email, password_hash, verification_code, role, status)
                     VALUES (?, ?, ?, ?, 'user', 'active')`;
      const params = [name, email, hashedPassword, verificationCode];

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Failed to create user' });
        }

        // Add activity
        db.run('INSERT INTO activities (description) VALUES (?)',
               [`New user registered: ${name} (${email})`]);

        res.status(201).json({ id: this.lastID, message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password, verificationCode } = req.body;

  if (!email || !password || !verificationCode) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Get user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({ error: 'Failed to login' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check verification code
      if (user.verification_code !== verificationCode) {
        return res.status(401).json({ error: 'Invalid verification code' });
      }

      // Return user info (excluding password)
      const { password_hash, ...userInfo } = user;
      res.json({ message: 'Login successful', user: userInfo });
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;
