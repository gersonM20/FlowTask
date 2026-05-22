/**
 * controllers/categoriesController.js — Lógica de negocio para categorías
 *
 * Las categorías son opcionales en las tareas (FK con ON DELETE SET NULL),
 * por lo que eliminar una categoría no elimina las tareas asociadas,
 * solo les quita la referencia.
 *
 * Para extender:
 *  - Agregar GET /categories/:id para obtener una categoría específica
 *  - Agregar paginación si el número de categorías crece
 *  - Agregar validación del formato del color (regex /#[0-9a-fA-F]{6}/)
 */

const pool = require("../db/connection");

// ─── GET /api/categories ──────────────────────────────────────────────────────

/**
 * Lista todas las categorías con el conteo de tareas de cada una.
 * El LEFT JOIN garantiza que categorías sin tareas aparezcan con task_count = 0.
 * El ::int convierte el bigint que devuelve COUNT a un número normal de JavaScript.
 */
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

// ─── POST /api/categories ─────────────────────────────────────────────────────

/**
 * Crea una nueva categoría. Solo el nombre es obligatorio.
 * El color tiene valor por defecto en la BD pero también se puede sobreescribir.
 * El código de error 23505 es la violación de UNIQUE constraint de PostgreSQL.
 */
async function createCategory(req, res, next) {
  try {
    const { name, color, icon } = req.body;
    if (!name) return res.status(400).json({ error: "El campo name es obligatorio" });

    const { rows } = await pool.query(
      "INSERT INTO categories (name, color, icon) VALUES ($1, $2, $3) RETURNING *",
      [name.trim(), color || "#2563eb", icon || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Ya existe una categoría con ese nombre" });
    }
    next(err);
  }
}

// ─── PATCH /api/categories/:id ────────────────────────────────────────────────

/**
 * Actualización parcial: solo se modifican los campos presentes en el body.
 * Mismo patrón de SET dinámico que en tasksController para mantener consistencia.
 */
async function updateCategory(req, res, next) {
  try {
    const { name, color, icon } = req.body;

    const fields = [];
    const values = [];
    let   idx    = 1;

    if (name  !== undefined) { fields.push(`name = $${idx++}`);  values.push(name.trim()); }
    if (color !== undefined) { fields.push(`color = $${idx++}`); values.push(color); }
    if (icon  !== undefined) { fields.push(`icon = $${idx++}`);  values.push(icon); }

    if (!fields.length) return res.status(400).json({ error: "No se enviaron campos a actualizar" });

    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!rows.length) return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Ya existe una categoría con ese nombre" });
    }
    next(err);
  }
}

// ─── DELETE /api/categories/:id ───────────────────────────────────────────────

/**
 * Elimina una categoría.
 * Las tareas asociadas quedan con category_id = NULL gracias a ON DELETE SET NULL
 * definido en el schema de init.sql. Esto es intencional para no perder las tareas.
 */
async function deleteCategory(req, res, next) {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM categories WHERE id = $1",
      [req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Categoría no encontrada" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
