const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET || "rahasiaSuperAman";

// REGISTER
router.post("/register", async (req, res) => {
  const { name, phone, username, password, address } = req.body;

  if (!name || !phone || !username || !password || !address) {
    return res
      .status(400)
      .json({ success: false, message: "Semua field wajib diisi" });
  }

  try {
    const existing = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "Username sudah digunakan" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (name, phone, username, password, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, phone, username, address`,
      [name, phone, username, hashed, address]
    );

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        username: user.username,
        address: user.address,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
});

// GET Profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, phone, username, address FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({
      success: true,
      message: "Profile ditemukan",
      data: result.rows[0],
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
});

// UPDATE Profile
router.put("/update", verifyToken, async (req, res) => {
  const { name, phone, address } = req.body;

  if (!name || !phone || !address) {
    return res
      .status(400)
      .json({ success: false, message: "Field tidak boleh kosong" });
  }

  try {
    const result = await db.query(
      `UPDATE users
       SET name = $1, phone = $2, address = $3
       WHERE id = $4
       RETURNING id, name, phone, username, address`,
      [name, phone, address, req.user.id]
    );

    res.json({
      success: true,
      message: "Profil berhasil diupdate",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Update error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
});

module.exports = router;
