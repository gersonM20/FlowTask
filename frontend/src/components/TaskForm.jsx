/**
 * components/TaskForm.jsx — Modal para crear o editar una tarea
 *
 * Modo creación: se abre sin prop `task` (null). El formulario está vacío
 *   y el primer usuario de la lista queda seleccionado por defecto.
 * Modo edición: se abre con prop `task`. El useEffect sincroniza los
 *   valores del formulario con los datos de la tarea recibida.
 *
 * Manejo de errores:
 *  - Los errores del servidor se muestran dentro del modal sin cerrarlo,
 *    para que el usuario pueda corregir y reintentar.
 *  - El botón de guardar se deshabilita mientras se envía para evitar doble submit.
 *
 * Para extender:
 *  - Agregar validación de fecha mínima (no permitir due_date en el pasado)
 *  - Agregar campo de tags o etiquetas adicionales
 *  - Reemplazar window.confirm por un modal de confirmación personalizado
 */

import { useState, useEffect } from "react";
import "../styles/taskForm.css";

/** Estado inicial del formulario (tarea en blanco) */
const EMPTY = {
  title: "", description: "", status: "pending",
  priority: "medium", due_date: "", category_id: "", user_id: "",
};

/**
 * @param {object|null} task       - Tarea a editar, o null para crear una nueva
 * @param {Array}       categories - Lista de categorías para el select
 * @param {Array}       users      - Lista de usuarios para el select de asignación
 * @param {function}    onSave     - Callback async: recibe el payload y guarda
 * @param {function}    onClose    - Callback para cerrar el modal
 */
export default function TaskForm({ task, categories, users, onSave, onClose }) {
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);

  /**
   * Sincroniza el formulario cada vez que cambia la prop `task`.
   * Esto cubre el caso de abrir "editar" en dos tareas distintas sin cerrar el modal.
   * due_date se recorta a YYYY-MM-DD porque el input[type=date] requiere ese formato
   * y la BD puede devolver un timestamp completo.
   */
  useEffect(() => {
    if (task) {
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
      // En modo creación: asignar el primer usuario disponible como valor por defecto
      setForm({ ...EMPTY, user_id: users[0]?.id || "" });
    }
  }, [task, users]);

  /** Handler genérico: actualiza solo el campo correspondiente */
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevenir recarga de página
    setError(null);
    setSaving(true);
    try {
      await onSave({
        ...form,
        // Convertir strings vacíos a null: la BD espera null, no ""
        due_date:    form.due_date    || null,
        category_id: form.category_id || null,
      });
      onClose(); // cerrar el modal solo si el guardado fue exitoso
    } catch (err) {
      setError(err.message); // mostrar el error del backend sin cerrar el modal
    } finally {
      setSaving(false);
    }
  };

  return (
    /* role="dialog" + aria-modal="true" comunica a lectores de pantalla
       que es un modal que bloquea el contenido detrás */
    <div className="modal-overlay" role="dialog" aria-modal="true"
      aria-label={task ? "Editar tarea" : "Nueva tarea"}>
      <div className="modal">

        <div className="modal__header">
          <h2 className="modal__title">{task ? "Editar tarea" : "Nueva tarea"}</h2>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar modal">✕</button>
        </div>

        <form className="task-form" onSubmit={handleSubmit} noValidate>

          {/* Error del servidor — aparece solo si hay error */}
          {error && <p className="error-banner">{error}</p>}

          <div className="form-group">
            <label className="form-label" htmlFor="tf-title">Título *</label>
            <input id="tf-title" className="form-input" type="text"
              value={form.title} onChange={set("title")}
              placeholder="¿Qué hay que hacer?" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tf-desc">Descripción</label>
            <textarea id="tf-desc" className="form-textarea"
              value={form.description} onChange={set("description")}
              placeholder="Detalles opcionales…" />
          </div>

          {/* Estado y prioridad en una fila de dos columnas */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="tf-status">Estado</label>
              <select id="tf-status" className="form-select" value={form.status} onChange={set("status")}>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tf-priority">Prioridad</label>
              <select id="tf-priority" className="form-select" value={form.priority} onChange={set("priority")}>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>

          {/* Fecha y categoría en otra fila */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="tf-due">Fecha límite</label>
              <input id="tf-due" className="form-input" type="date"
                value={form.due_date} onChange={set("due_date")} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tf-cat">Categoría</label>
              <select id="tf-cat" className="form-select" value={form.category_id} onChange={set("category_id")}>
                <option value="">Sin categoría</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tf-user">Asignada a *</label>
            <select id="tf-user" className="form-select" value={form.user_id} onChange={set("user_id")} required>
              <option value="">Seleccionar usuario…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div className="form-actions">
            {/* Cancelar no hace submit — solo cierra el modal */}
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Cancelar
            </button>
            {/* disabled mientras se guarda para evitar doble envío */}
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Guardando…" : task ? "Guardar cambios" : "Crear tarea"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
