import "../styles/taskCard.css";

function formatDue(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dateStr, status) {
  if (!dateStr || ["completed", "cancelled"].includes(status)) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const overdue  = isOverdue(task.due_date, task.status);
  const dueLabel = formatDue(task.due_date);

  return (
    <article
      className={`task-card task-card--${task.priority} ${task.status === "completed" ? "task-card--completed" : ""}`}
      role="listitem"
    >
      <div className="task-card__body">
        <h3 className="task-card__title">{task.title}</h3>
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}

        <div className="task-card__meta">
          {/* Status badge */}
          <span className={`badge badge--${task.status}`}>
            {task.status.replace("_", " ")}
          </span>

          {/* Priority badge */}
          <span className={`badge badge--${task.priority}`}>
            {task.priority}
          </span>

          {/* Category pill */}
          {task.category_name && (
            <span
              className="task-card__category"
              style={{ background: task.category_color || "#6366f1" }}
            >
              {task.category_name}
            </span>
          )}

          {/* Due date */}
          {dueLabel && (
            <span className={`task-card__due${overdue ? " task-card__due--overdue" : ""}`}>
              {overdue ? "⚠️" : "📅"} {dueLabel}
            </span>
          )}
        </div>
      </div>

      <div className="task-card__actions">
        {/* Toggle complete */}
        <button
          className="task-card__btn task-card__btn--done"
          onClick={() => onToggleStatus(task)}
          title={task.status === "completed" ? "Mark as pending" : "Mark as complete"}
          aria-label={task.status === "completed" ? "Mark as pending" : "Mark as complete"}
        >
          {task.status === "completed" ? "↩" : "✓"}
        </button>

        {/* Edit */}
        <button
          className="task-card__btn"
          onClick={() => onEdit(task)}
          title="Edit task"
          aria-label="Edit task"
        >
          ✏️
        </button>

        {/* Delete */}
        <button
          className="task-card__btn task-card__btn--delete"
          onClick={() => onDelete(task.id)}
          title="Delete task"
          aria-label="Delete task"
        >
          🗑
        </button>
      </div>
    </article>
  );
}
