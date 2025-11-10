const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../database/db");

router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword, verificationCode } = req.body;

  if (!name || !email || !password || !confirmPassword || !verificationCode) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  const role = verificationCode.startsWith("ADM") ? "admin" : "user";

  try {
    db.get(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, row) => {
        if (err) {
          console.error("Error checking user:", err);
          return res.status(500).json({ error: "Failed to register user" });
        }

        if (row) {
          return res.status(409).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (name, email, password_hash, verification_code, role, status)
                     VALUES (?, ?, ?, ?, ?, 'active')`;
        const params = [name, email, hashedPassword, verificationCode, role];

        db.run(query, params, function (err) {
          if (err) {
            console.error("Error creating user:", err);
            return res.status(500).json({ error: "Failed to create user" });
          }

          db.run("INSERT INTO activities (description) VALUES (?)", [
            `New user registered: ${name} (${email}) as ${role}`,
          ]);

          res
            .status(201)
            .json({
              id: this.lastID,
              message: "User registered successfully",
              role: role,
            });
        });
      }
    );
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, verificationCode } = req.body;

  if (!email || !password || !verificationCode) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error("Error fetching user:", err);
          return res.status(500).json({ error: "Failed to login" });
        }

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password_hash
        );
        if (!isPasswordValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        if (user.verification_code !== verificationCode) {
          return res.status(401).json({ error: "Invalid verification code" });
        }

        req.session.userId = user.id;
        req.session.userRole = user.role;

        const { password_hash, ...userInfo } = user;
        res.json({
          message: "Login successful",
          user: userInfo,
          redirectTo:
            user.role === "admin" ? "/dashboard.html" : "/user-dashboard.html",
        });
      }
    );
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/check-user", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error("Error checking user:", err);
      return res.status(500).json({ error: "Failed to check user" });
    }

    res.json({ exists: !!row });
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

router.post("/verify-admin-password", requireAdmin, async (req, res) => {
  const { password, verificationCode } = req.body;

  if (!password || !verificationCode) {
    return res.status(400).json({ error: "Password and verification code are required" });
  }

  try {
    db.get(
      "SELECT password_hash, verification_code FROM users WHERE id = ?",
      [req.session.userId],
      async (err, user) => {
        if (err) {
          console.error("Error fetching user:", err);
          return res.status(500).json({ error: "Failed to verify password" });
        }

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password_hash
        );
        if (!isPasswordValid || user.verification_code !== verificationCode) {
          return res.status(401).json({ error: "Incorrect password or verification code" });
        }

        res.json({ message: "Password verified successfully" });
      }
    );
  } catch (error) {
    console.error("Error verifying password:", error);
    res.status(500).json({ error: "Failed to verify password" });
  }
});

module.exports = { router, requireAdmin };
