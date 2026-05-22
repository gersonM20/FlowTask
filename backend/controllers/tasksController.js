const pool = require("../db/connection");

// GET /api/tasks
// Devuelve todas las tareas con información de usuario y categoría.
// Acepta filtros opcionales por query string: status, priority, category_id, user_id, search.
async function getAllTasks(req, res, next) {
  try {
    const { status, priority, category_id, search, user_id } = req.query;

    // Construimos la cláusula WHERE de forma dinámica para evitar SQL injection.
    // Cada condición usa un placeholder ($1, $2...) que pg reemplaza de forma segura.
    const conditions = [];
    const values     = [];
    let   idx        = 1; // índice del placeholder actual

    if (status)      { conditions.push(`t.status = $${idx++}`);      values.push(status); }
    if (priority)    { conditions.push(`t.priority = $${idx++}`);    values.push(priority); }
    if (category_id) { conditions.push(`t.category_id = $${idx++}`); values.push(category_id); }
    if (user_id)     { conditions.push(`t.user_id = $${idx++}`);     values.push(user_id); }

    // Búsqueda full-text usando el índice GIN creado en init.sql
    if (search) {
      conditions.push(`to_tsvector('english', t.title) @@ plainto_tsquery('english', $${idx++})`);
      values.push(search);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // JOIN con users (siempre) y categories (LEFT JOIN porque la categoría es opcional)
    // ORDER BY prioridad descendente (urgent primero) y luego por fecha de vencimiento
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
       JOIN users      u ON u.id = t.user_id
       LEFT JOIN categories c ON c.id = t.category_id
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
    // Pasamos el error al manejador global definido en server.js
    next(err);
  }
}

// GET /api/tasks/stats
// Devuelve conteos agrupados por estado para los KPIs del dashboard.
// Usa FILTER para calcular múltiples agregaciones en una sola pasada sobre la tabla.
async function getTaskStats(req, res, next) {
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
             AND status NOT IN ('completed','cancelled')
         )                                                        AS overdue
       FROM tasks`
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/:id
// Devuelve una tarea específica enriquecida con datos de usuario y categoría.
async function getTaskById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT
         t.*, u.name AS user_name, u.email AS user_email,
         c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM tasks t
       JOIN users u ON u.id = t.user_id
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

// POST /api/tasks
// Crea una nueva tarea. Los campos obligatorios son title y user_id.
async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, due_date, user_id, category_id } = req.body;

    // Validaciones básicas de entrada
    if (!title)   return res.status(400).json({ error: "El campo title es obligatorio" });
    if (!user_id) return res.status(400).json({ error: "El campo user_id es obligatorio" });

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, user_id, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        description  || null,
        status       || "pending",   // valor por defecto si no se envía
        priority     || "medium",    // valor por defecto si no se envía
        due_date     || null,
        user_id,
        category_id  || null,
      ]
    );

    // 201 Created con el objeto recién creado
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:id
// Actualización parcial: solo se actualizan los campos que vengan en el body.
// Esto evita sobreescribir campos que el cliente no quiso modificar.
async function updateTask(req, res, next) {
  try {
    const { title, description, status, priority, due_date, category_id } = req.body;

    // Construimos el SET dinámicamente igual que el WHERE en getAllTasks
    const fields = [];
    const values = [];
    let   idx    = 1;

    if (title       !== undefined) { fields.push(`title = $${idx++}`);       values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (status      !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(status);
      // Registramos automáticamente cuándo se completó/descompletó la tarea
      if (status === "completed") {
        fields.push(`completed_at = NOW()`);
      } else {
        fields.push(`completed_at = NULL`);
      }
    }
    if (priority    !== undefined) { fields.push(`priority = $${idx++}`);    values.push(priority); }
    if (due_date    !== undefined) { fields.push(`due_date = $${idx++}`);    values.push(due_date); }
    if (category_id !== undefined) { fields.push(`category_id = $${idx++}`); values.push(category_id); }

    if (!fields.length) return res.status(400).json({ error: "No se enviaron campos a actualizar" });

    // El id de la tarea va al final del array de valores
    values.push(req.params.id);

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

// DELETE /api/tasks/:id
// Elimina una tarea y devuelve 204 No Content si tuvo éxito.
async function deleteTask(req, res, next) {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [req.params.id]
    );

    if (!rowCount) return res.status(404).json({ error: "Tarea no encontrada" });

    // 204: eliminación exitosa, sin cuerpo en la respuesta
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllTasks, getTaskById, getTaskStats, createTask, updateTask, deleteTask };
