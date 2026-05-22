import { useState, useEffect } from "react";
import "../styles/taskForm.css";

// Valores iniciales del formulario (tarea en blanco)
const EMPTY = {
  title:       "",
  description: "",
  status:      "pending",
  priority:    "medium",
  due_date:    "",
  category_id: "",
  user_id:     "",
};

// Modal con formulario para crear o editar una tarea.
// Si se pasa la prop `task`, el formulario se pre-rellena con sus datos (modo edición).
// Si no se pasa, el formulario está vacío (modo creación).
export default function TaskForm({ task, categories, users, onSave, onClose }) {
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  // Cuando cambia la prop `task` (ej. el usuario abre editar otra tarea),
  // sincronizamos el formulario con los nuevos datos
  useEffect(() => {
    if (task) {
      // Normalizamos due_date al formato YYYY-MM-DD que espera el input[type=date]
      setForm({
        title:       task.title       || "",
        description: task.description || "",
        status:      task.status      || "pending",
        priority:    task.priority    || "medium",
        due_date:    task.due_date    ? task.due_date.slice(0, 10) : "",
        category_id: task.category_id ?? "",
        user_id:     task.user_id     || "",
      });
    } else {
      // En modo creación, asignamos el primer usuario disponible por defecto
      setForm({ ...EMPTY, user_id: users[0]?.id || "" });
    }
  }, [task, users]);

  // Handler genérico: actualiza solo el campo correspondiente del estado del formulario
  const handle = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); // evita recarga de la página
    setError(null);
    setSaving(true);
    try {
      // Convertimos strings vacíos a null para no enviar campos vacíos a la BD
      const payload = {
        ...form,
        due_date:    form.due_date    || null,
        category_id: form.category_id || null,
      };
      await onSave(payload);
      onClose(); // cierra el modal solo si el guardado fue exitoso
    } catch (err) {
      // Mostramos el error del backend dentro del modal, sin cerrarlo
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    // role="dialog" y aria-modal="true" mejoran la accesibilidad del modal
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={task ? "Editar tarea" : "Nueva tarea"}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">{task ? "Editar Tarea" : "Nueva Tarea"}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          {/* Mensaje de error del servidor */}
          {error && <p className="error-message">{error}</p>}

          <div className="form-group">
            <label htmlFor="tf-title">Título *</label>
            <input
              id="tf-title"
              type="text"
              value={form.title}
              onChange={handle("title")}
              placeholder="¿Qué hay que hacer?"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tf-desc">Descripción</label>
            <textarea
              id="tf-desc"
              value={form.description}
              onChange={handle("description")}
              placeholder="Detalles opcionales…"
            />
          </div>

          {/* Fila de dos columnas para estado y prioridad */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tf-status">Estado</label>
              <select id="tf-status" value={form.status} onChange={handle("status")}>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tf-priority">Prioridad</label>
              <select id="tf-priority" value={form.priority} onChange={handle("priority")}>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>

          {/* Fila de dos columnas para fecha y categoría */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tf-due">Fecha límite</label>
              <input id="tf-due" type="date" value={form.due_date} onChange={handle("due_date")} />
            </div>

            <div className="form-group">
              <label htmlFor="tf-category">Categoría</label>
              <select id="tf-category" value={form.category_id} onChange={handle("category_id")}>
                <option value="">Sin categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tf-user">Asignada a</label>
            <select id="tf-user" value={form.user_id} onChange={handle("user_id")} required>
              <option value="">Seleccionar usuario…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            {/* Deshabilitado mientras se guarda para evitar doble envío */}
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Guardando…" : task ? "Guardar Cambios" : "Crear Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
