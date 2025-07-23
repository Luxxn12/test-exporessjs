const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db");
const fs = require("fs");

const router = express.Router();


// Buat folder uploads jika belum ada
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Jenis file tidak diizinkan"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload file
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File berhasil diupload
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Tidak ada file yang diupload" });
    }

    const originalName = req.file.originalname;
    const storedPath = `/uploads/${req.file.filename}`;

    // Simpan ke PostgreSQL
    await db.query(
      "INSERT INTO uploaded_files (original_name, stored_path) VALUES ($1, $2)",
      [originalName, storedPath]
    );

    res.json({
      message: "Upload berhasil",
      originalName,
      path: storedPath,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan saat upload" });
  }
});

/**
 * @swagger
 * /api/upload:
 *   get:
 *     summary: Ambil semua file yang sudah diupload
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar file
 */
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM uploaded_files ORDER BY uploaded_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data file" });
  }
});

module.exports = router;
