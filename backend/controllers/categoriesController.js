const pool = require("../db/connection");

// GET /api/categories
// Devuelve todas las categorías junto con la cantidad de tareas asociadas.
// El LEFT JOIN asegura que categorías sin tareas también aparezcan (con task_count = 0).
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

// POST /api/categories
// Crea una nueva categoría. Solo el nombre es obligatorio.
async function createCategory(req, res, next) {
  try {
    const { name, color, icon } = req.body;

    if (!name) return res.status(400).json({ error: "El campo name es obligatorio" });

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
