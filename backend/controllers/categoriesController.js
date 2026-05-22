const pool = require("../db/connection");

async function getAllCategories(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, COUNT(t.id)::int AS task_count
       FROM categories c
       LEFT JOIN tasks t ON t.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const { rows } = await pool.query(
      "INSERT INTO categories (name, color, icon) VALUES ($1, $2, $3) RETURNING *",
      [name, color || "#6366f1", icon || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllCategories, createCategory };
