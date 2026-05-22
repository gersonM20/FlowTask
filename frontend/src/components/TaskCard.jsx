/**
 * components/TaskCard.jsx — Tarjeta individual de tarea
 *
 * Muestra el resumen de una tarea: título, descripción truncada,
 * badge de estado, chip de categoría, fecha de vencimiento y botones de acción.
 *
 * Decisiones de diseño:
 *  - El borde izquierdo de color indica la prioridad visualmente sin texto extra
 *  - Las tareas completadas se muestran con opacidad reducida y tachado
 *  - La detección de "vencida" se hace en el cliente para evitar una columna
 *    extra en la BD (se puede calcular de due_date + status)
 *
 * Para extender:
 *  - Agregar drag & drop: envolver en un elemento draggable
 *  - Agregar vista expandida: manejar un estado isExpanded local
 *  - Agregar asignado: mostrar el avatar del usuario con user_name
 */

import "../styles/taskCard.css";

/**
 * Formatea una fecha ISO a "DD MMM" en español (ej. "5 jun")
 * @param {string|null} dateStr
 * @returns {string|null}
 */
function formatDue(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric", month: "short",
  });
}

/**
 * Determina si una tarea está vencida.
 * Las completadas y canceladas nunca se consideran vencidas
 * aunque su fecha haya pasado.
 *
 * @param {string|null} dateStr - due_date de la tarea
 * @param {string}      status  - status de la tarea
 */
function isOverdue(dateStr, status) {
  if (!dateStr || ["completed", "cancelled"].includes(status)) return false;
  // Comparar solo la fecha (sin hora) convirtiendo a string de fecha local
  return new Date(dateStr) < new Date(new Date().toDateString());
}

/** Etiquetas en español para cada estado */
const STATUS_LABEL = {
  pending:     "Pendiente",
  in_progress: "En progreso",
  completed:   "Completada",
  cancelled:   "Cancelada",
};

/**
 * @param {object}   task            - Objeto tarea del backend (con campos de usuario y categoría)
 * @param {function} onEdit          - Callback: recibe la tarea para abrir el formulario de edición
 * @param {function} onDelete        - Callback: recibe el id para confirmar y eliminar
 * @param {function} onToggleStatus  - Callback: recibe la tarea para alternar completado/pendiente
 */
export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const overdue  = isOverdue(task.due_date, task.status);
  const dueLabel = formatDue(task.due_date);

  return (
    <article
      className={[
        "task-card",
        `task-card--${task.priority}`,                           // color del borde izquierdo
        task.status === "completed" ? "task-card--completed" : "", // opacidad reducida
      ].join(" ").trim()}
      role="listitem"
    >

      {/* ── Contenido principal ── */}
      <div className="task-card__body">
        <h3 className="task-card__title">{task.title}</h3>

        {/* Descripción truncada a 1 línea via CSS (-webkit-line-clamp) */}
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}

        <div className="task-card__meta">
          {/* Badge de estado */}
          <span className={`badge badge--${task.status}`}>
            {STATUS_LABEL[task.status] ?? task.status}
          </span>

          {/* Chip de categoría con el color personalizado */}
          {task.category_name && (
            <span className="task-card__category-chip">
              <span
                className="color-dot"
                style={{ background: task.category_color || "#64748b" }}
              />
              {task.category_name}
            </span>
          )}

          {/* Fecha de vencimiento con alerta visual si ya pasó */}
          {dueLabel && (
            <span className={`task-card__due${overdue ? " task-card__due--overdue" : ""}`}>
              {overdue ? "Vencida · " : ""}{dueLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Botones de acción ── */}
      <div className="task-card__actions">

        {/* Completar / reabrir */}
        <button
          className="task-card__action-btn task-card__action-btn--complete"
          onClick={() => onToggleStatus(task)}
          title={task.status === "completed" ? "Marcar como pendiente" : "Marcar como completada"}
        >
          {task.status === "completed" ? "↩" : "✓"}
        </button>

        {/* Editar — pasa la tarea completa para pre-rellenar el formulario */}
        <button
          className="task-card__action-btn"
          onClick={() => onEdit(task)}
          title="Editar tarea"
        >
          ✎
        </button>

        {/* Eliminar — la confirmación se maneja en el componente padre */}
        <button
          className="task-card__action-btn task-card__action-btn--delete"
          onClick={() => onDelete(task.id)}
          title="Eliminar tarea"
        >
          ✕
        </button>

      </div>
    </article>
  );
}
