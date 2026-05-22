const pool = require("../db/connection");

// GET /api/users
// Devuelve todos los usuarios con la cantidad de tareas asignadas a cada uno.
async function getAllUsers(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, u.created_at,
              COUNT(t.id)::int AS task_count
       FROM users u
       LEFT JOIN tasks t ON t.user_id = u.id
       GROUP BY u.id
       ORDER BY u.name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
// Devuelve los datos de un usuario específico sin incluir información sensible.
async function getUserById(req, res, next) {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, avatar_url, created_at FROM users WHERE id = $1",
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, getUserById };
