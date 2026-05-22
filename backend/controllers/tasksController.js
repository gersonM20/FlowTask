/**
 * controllers/tasksController.js — Lógica de negocio para tareas
 *
 * Cada función recibe (req, res, next) de Express y ejecuta la operación
 * correspondiente contra la base de datos. Los errores se pasan a next(err)
 * para que el manejador global de server.js los capture.
 *
 * Decisiones de diseño:
 *  - Se usa PATCH (actualización parcial) en lugar de PUT para evitar
 *    sobreescribir campos que el cliente no envió.
 *  - Las queries usan placeholders ($1, $2…) de pg para prevenir SQL Injection.
 *  - El SET dinámico en updateTask construye solo los campos enviados,
 *    lo que permite actualizar un solo campo sin conocer el resto.
 *
 * Para extender:
 *  - Agregar paginación en getAllTasks: LIMIT $n OFFSET $m
 *  - Agregar ordenamiento dinámico: ORDER BY ${campoValidado} ${dirección}
 *  - Agregar filtro por rango de fechas: due_date BETWEEN $x AND $y
 */

const pool = require("../db/connection");

// ─── GET /api/tasks ───────────────────────────────────────────────────────────

/**
 * Devuelve todas las tareas con datos de usuario y categoría.
 * Acepta filtros opcionales por query string: status, priority,
 * category_id, user_id, search.
 *
 * La búsqueda full-text usa el índice GIN creado en init.sql,
 * por lo que es eficiente incluso con miles de tareas.
 */
async function getAllTasks(req, res, next) {
  try {
    const { status, priority, category_id, search, user_id } = req.query;

    // Construcción dinámica del WHERE: solo se agregan condiciones
    // para los filtros que el cliente realmente envió
    const conditions = [];
    const values     = [];
    let   idx        = 1; // índice del placeholder ($1, $2…)

    if (status)      { conditions.push(`t.status = $${idx++}`);      values.push(status); }
    if (priority)    { conditions.push(`t.priority = $${idx++}`);    values.push(priority); }
    if (category_id) { conditions.push(`t.category_id = $${idx++}`); values.push(category_id); }
    if (user_id)     { conditions.push(`t.user_id = $${idx++}`);     values.push(user_id); }

    // plainto_tsquery convierte el texto libre en una query de búsqueda
    // tolerante a errores, sin necesidad de sintaxis especial del usuario
    if (search) {
      conditions.push(`to_tsvector('english', t.title) @@ plainto_tsquery('english', $${idx++})`);
      values.push(search);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // LEFT JOIN en categories porque la categoría es opcional en una tarea
    // El ORDER BY con CASE prioriza las tareas urgentes arriba
    const { rows } = await pool.query(
      `SELECT
         t.id, t.title, t.description, t.status, t.priority,
         t.due_date, t.completed_at, t.created_at, t.updated_at,
         t.user_id,
         u.name  AS user_name,
         u.email AS user_email,
         t.category_id,
         c.name  AS category_name,
         c.color AS category_color,
         c.icon  AS category_icon
       FROM tasks t
       JOIN       users      u ON u.id = t.user_id
       LEFT JOIN  categories c ON c.id = t.category_id
       ${where}
       ORDER BY
         CASE t.priority
           WHEN 'urgent' THEN 1
           WHEN 'high'   THEN 2
           WHEN 'medium' THEN 3
           WHEN 'low'    THEN 4
         END,
         t.due_date ASC NULLS LAST`,
      values
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/tasks/stats ─────────────────────────────────────────────────────

/**
 * Devuelve conteos agrupados para los KPIs del dashboard.
 * Usa FILTER (extensión de SQL estándar soportada por PostgreSQL) para calcular
 * múltiples agregaciones en una sola pasada sobre la tabla, lo que es más
 * eficiente que ejecutar 5 queries COUNT separadas.
 */
async function getTaskStats(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)                                                  AS total,
         COUNT(*) FILTER (WHERE status = 'pending')               AS pending,
         COUNT(*) FILTER (WHERE status = 'in_progress')           AS in_progress,
         COUNT(*) FILTER (WHERE status = 'completed')             AS completed,
         COUNT(*) FILTER (WHERE status = 'cancelled')             AS cancelled,
         COUNT(*) FILTER (
           WHERE due_date < CURRENT_DATE
             AND status NOT IN ('completed', 'cancelled')
         )                                                        AS overdue
       FROM tasks`
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────

/**
 * Devuelve una tarea específica enriquecida con datos de usuario y categoría.
 * Útil para pre-rellenar el formulario de edición sin datos parciales.
 */
async function getTaskById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT
         t.*,
         u.name  AS user_name,
         u.email AS user_email,
         c.name  AS category_name,
         c.color AS category_color,
         c.icon  AS category_icon
       FROM tasks t
       JOIN      users      u ON u.id = t.user_id
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.id = $1`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────

/**
 * Crea una nueva tarea. title y user_id son obligatorios.
 * Los demás campos tienen valores por defecto en la BD o se aceptan como null.
 *
 * Para extender: agregar validación de formato de due_date,
 * o verificar que user_id exista antes de insertar.
 */
async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, due_date, user_id, category_id } = req.body;

    if (!title)   return res.status(400).json({ error: "El campo title es obligatorio" });
    if (!user_id) return res.status(400).json({ error: "El campo user_id es obligatorio" });

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, user_id, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        description  || null,
        status       || "pending",  // valor por defecto si el cliente no envía status
        priority     || "medium",   // valor por defecto si el cliente no envía priority
        due_date     || null,
        user_id,
        category_id  || null,
      ]
    );

    res.status(201).json(rows[0]); // 201 Created con el objeto recién insertado
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/tasks/:id ─────────────────────────────────────────────────────

/**
 * Actualización parcial: solo se modifican los campos presentes en el body.
 * Esto permite, por ejemplo, cambiar solo el status desde el botón de la UI
 * sin necesidad de enviar todos los demás campos.
 *
 * El SET dinámico construye la query con los campos recibidos,
 * usando el mismo patrón de índices ($1, $2…) que previene SQL Injection.
 */
async function updateTask(req, res, next) {
  try {
    const { title, description, status, priority, due_date, category_id } = req.body;

    const fields = [];
    const values = [];
    let   idx    = 1;

    if (title       !== undefined) { fields.push(`title = $${idx++}`);       values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (status      !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(status);
      // Registrar automáticamente cuándo se completó o se reabrió la tarea
      // sin requerir que el cliente envíe este campo
      fields.push(status === "completed" ? "completed_at = NOW()" : "completed_at = NULL");
    }
    if (priority    !== undefined) { fields.push(`priority = $${idx++}`);    values.push(priority); }
    if (due_date    !== undefined) { fields.push(`due_date = $${idx++}`);    values.push(due_date); }
    if (category_id !== undefined) { fields.push(`category_id = $${idx++}`); values.push(category_id); }

    if (!fields.length) return res.status(400).json({ error: "No se enviaron campos a actualizar" });

    values.push(req.params.id); // el id siempre va al final del array

    const { rows } = await pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!rows.length) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────

/**
 * Elimina una tarea permanentemente.
 * Devuelve 204 No Content (sin cuerpo) si tuvo éxito, estándar REST.
 */
async function deleteTask(req, res, next) {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [req.params.id]
    );

    if (!rowCount) return res.status(404).json({ error: "Tarea no encontrada" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllTasks, getTaskById, getTaskStats, createTask, updateTask, deleteTask };
