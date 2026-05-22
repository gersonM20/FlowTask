const pool = require("../db/connection");

// GET /api/tasks?status=&priority=&category_id=&search=&user_id=
async function getAllTasks(req, res, next) {
  try {
    const { status, priority, category_id, search, user_id } = req.query;

    // Build query dynamically based on provided filters
    const conditions = [];
    const values     = [];
    let   idx        = 1;

    if (status)      { conditions.push(`t.status = $${idx++}`);       values.push(status); }
    if (priority)    { conditions.push(`t.priority = $${idx++}`);     values.push(priority); }
    if (category_id) { conditions.push(`t.category_id = $${idx++}`);  values.push(category_id); }
    if (user_id)     { conditions.push(`t.user_id = $${idx++}`);      values.push(user_id); }
    if (search)      {
      conditions.push(`to_tsvector('english', t.title) @@ plainto_tsquery('english', $${idx++})`);
      values.push(search);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

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
    next(err);
  }
}

// GET /api/tasks/stats
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

    if (!rows.length) return res.status(404).json({ error: "Task not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks
async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, due_date, user_id, category_id } = req.body;

    if (!title)   return res.status(400).json({ error: "title is required" });
    if (!user_id) return res.status(400).json({ error: "user_id is required" });

    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date, user_id, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        description  || null,
        status       || "pending",
        priority     || "medium",
        due_date     || null,
        user_id,
        category_id  || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/tasks/:id
async function updateTask(req, res, next) {
  try {
    const { title, description, status, priority, due_date, category_id } = req.body;

    // Build SET clause dynamically (only provided fields)
    const fields = [];
    const values = [];
    let   idx    = 1;

    if (title       !== undefined) { fields.push(`title = $${idx++}`);       values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (status      !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(status);
      // Auto-set completed_at when marking complete
      if (status === "completed") {
        fields.push(`completed_at = NOW()`);
      } else {
        fields.push(`completed_at = NULL`);
      }
    }
    if (priority    !== undefined) { fields.push(`priority = $${idx++}`);    values.push(priority); }
    if (due_date    !== undefined) { fields.push(`due_date = $${idx++}`);    values.push(due_date); }
    if (category_id !== undefined) { fields.push(`category_id = $${idx++}`); values.push(category_id); }

    if (!fields.length) return res.status(400).json({ error: "No fields to update" });

    values.push(req.params.id);

    const { rows } = await pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (!rows.length) return res.status(404).json({ error: "Task not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM tasks WHERE id = $1",
      [req.params.id]
    );

    if (!rowCount) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllTasks, getTaskById, getTaskStats, createTask, updateTask, deleteTask };
