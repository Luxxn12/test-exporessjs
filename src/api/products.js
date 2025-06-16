const express = require("express");
const router = express.Router();
const db = require("../db");
const { encrypt, decrypt } = require("../utils/crypto");

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );

    const products = result.rows.map((product) => ({
      ...product,
      id: encrypt(product.id.toString()),
    }));

    res.json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  let decryptedId;

  try {
    decryptedId = decrypt(req.params.id);
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid encrypted ID" });
  }

  try {
    const result = await db.query("SELECT * FROM products WHERE id = $1", [
      decryptedId,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const product = result.rows[0];
    product.id = req.params.id;

    res.json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({
      success: false,
      message: "Name, price, and description are required",
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO products (name, price, description, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [name, price, description]
    );

    const newProduct = result.rows[0];
    newProduct.id = encrypt(newProduct.id.toString());

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.put("/:id", async (req, res) => {
  const { name, price, description } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({
      success: false,
      message: "Name, price, and description are required",
    });
  }

  let decryptedId;
  try {
    decryptedId = decrypt(req.params.id);
    console.log("test", decryptedId);
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid encrypted ID" });
  }

  try {
    const result = await db.query(
      `UPDATE products 
       SET name = $1, price = $2, description = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, price, description, decryptedId]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updatedProduct = result.rows[0];
    updatedProduct.id = req.params.id;

    res.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
