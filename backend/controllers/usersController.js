/**
 * controllers/usersController.js — Lógica de negocio para usuarios
 *
 * En esta aplicación los usuarios son simples "asignados" de tareas.
 * No hay sistema de autenticación; si se necesitara agregar login,
 * este sería el lugar para agregar las funciones signIn / signUp
 * y un campo `password_hash` en la tabla users.
 *
 * Para extender:
 *  - Agregar PATCH /users/:id para editar nombre, email o avatar
 *  - Agregar DELETE /users/:id (las tareas se eliminan en cascada por FK)
 *  - Agregar autenticación JWT: crear un authController.js separado
 */

const pool = require("../db/connection");

// ─── GET /api/users ───────────────────────────────────────────────────────────

/**
 * Lista todos los usuarios con el conteo de tareas asignadas.
 * No se incluye ningún campo sensible (como contraseñas).
 */
async function getAllUsers(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.avatar_url, u.created_at,
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

// ─── GET /api/users/:id ───────────────────────────────────────────────────────

/**
 * Devuelve los datos públicos de un usuario por su UUID.
 * Excluye campos internos como updated_at que no son relevantes para el cliente.
 */
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

// ─── POST /api/users ──────────────────────────────────────────────────────────

/**
 * Crea un nuevo usuario. name y email son obligatorios.
 * El email se normaliza a minúsculas antes de guardar para evitar duplicados
 * por diferencia de mayúsculas (ej. "Ana@mail.com" vs "ana@mail.com").
 *
 * El error 23505 de PostgreSQL indica violación de UNIQUE constraint (email duplicado).
 */
async function createUser(req, res, next) {
  try {
    const { name, email, avatar_url } = req.body;

    if (!name)  return res.status(400).json({ error: "El campo name es obligatorio" });
    if (!email) return res.status(400).json({ error: "El campo email es obligatorio" });

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, avatar_url)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, avatar_url, created_at`,
      [
        name.trim(),
        email.trim().toLowerCase(), // normalización para evitar duplicados por case
        avatar_url || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Ya existe un usuario con ese correo electrónico" });
    }
    next(err);
  }
}

module.exports = { getAllUsers, getUserById, createUser };
