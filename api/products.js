import express from 'express';
import db from '../db';

const app = express();
app.use(express.json());

app.get('/api/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO products(name, price, description) VALUES($1, $2, $3) RETURNING *',
      [name, price, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = app;
