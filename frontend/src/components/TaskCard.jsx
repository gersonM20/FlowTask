import "../styles/taskCard.css";

// Formatea una fecha ISO a texto legible (ej. "Jan 5")
function formatDue(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
}

// Determina si una tarea está vencida.
// Las tareas completadas o canceladas nunca se consideran vencidas.
function isOverdue(dateStr, status) {
  if (!dateStr || ["completed", "cancelled"].includes(status)) return false;
  // Comparamos solo la fecha (sin hora) para evitar falsos positivos intradiarios
  return new Date(dateStr) < new Date(new Date().toDateString());
}

// Tarjeta individual de tarea.
// Muestra título, descripción, badges de estado/prioridad, categoría y fecha.
// Recibe callbacks para editar, eliminar y alternar el estado de completado.
export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const overdue  = isOverdue(task.due_date, task.status);
  const dueLabel = formatDue(task.due_date);

  return (
    <article
      // La clase de prioridad controla el color del borde izquierdo (ver taskCard.css)
      className={`task-card task-card--${task.priority} ${task.status === "completed" ? "task-card--completed" : ""}`}
      role="listitem"
    >
      <div className="task-card__body">
        <h3 className="task-card__title">{task.title}</h3>

        {/* La descripción solo se renderiza si existe */}
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}

        <div className="task-card__meta">
          {/* Badge de estado: pending, in_progress, completed, cancelled */}
          <span className={`badge badge--${task.status}`}>
            {task.status.replace("_", " ")}
          </span>

          {/* Badge de prioridad */}
          <span className={`badge badge--${task.priority}`}>
            {task.priority}
          </span>

          {/* Etiqueta de categoría con el color personalizado de la categoría */}
          {task.category_name && (
            <span
              className="task-card__category"
              style={{ background: task.category_color || "#6366f1" }}
            >
              {task.category_name}
            </span>
          )}

          {/* Fecha de vencimiento con alerta visual si está vencida */}
          {dueLabel && (
            <span className={`task-card__due${overdue ? " task-card__due--overdue" : ""}`}>
              {overdue ? "⚠️" : "📅"} {dueLabel}
            </span>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="task-card__actions">
        {/* Alternar entre completado y pendiente */}
        <button
          className="task-card__btn task-card__btn--done"
          onClick={() => onToggleStatus(task)}
          title={task.status === "completed" ? "Marcar como pendiente" : "Marcar como completada"}
          aria-label={task.status === "completed" ? "Marcar como pendiente" : "Marcar como completada"}
        >
          {task.status === "completed" ? "↩" : "✓"}
        </button>

        {/* Abrir formulario de edición */}
        <button
          className="task-card__btn"
          onClick={() => onEdit(task)}
          title="Editar tarea"
          aria-label="Editar tarea"
        >
          ✏️
        </button>

        {/* Eliminar tarea (la confirmación se maneja en Dashboard) */}
        <button
          className="task-card__btn task-card__btn--delete"
          onClick={() => onDelete(task.id)}
          title="Eliminar tarea"
          aria-label="Eliminar tarea"
        >
          🗑
        </button>
      </div>
    </article>
  );
}
