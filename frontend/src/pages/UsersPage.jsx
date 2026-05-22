/**
 * pages/UsersPage.jsx — Gestión completa de usuarios (CRUD)
 *
 * Layout de dos columnas:
 *  - Izquierda: tabla con todos los usuarios y sus métricas (task_count)
 *  - Derecha: formulario sticky que alterna entre "crear" y "editar"
 *
 * Flujo de edición:
 *  1. Usuario hace clic en "Editar" → startEdit(u) carga los datos en el form
 *     y guarda editingId; la fila se resalta con color primario claro
 *  2. Usuario modifica y hace submit → updateUser(editingId, form)
 *  3. Se llama a load() para refrescar la tabla y se limpia editingId
 *
 * Flujo de eliminación:
 *  - Si el usuario tiene tareas asignadas, el confirm muestra una advertencia:
 *    las tareas se eliminarán en cascada (ON DELETE CASCADE en init.sql)
 *
 * Avatar:
 *  - Si el usuario tiene avatar_url se muestra la imagen
 *  - Si no, se muestra un placeholder con las iniciales (máx. 2) generadas
 *    por la función initials()
 *
 * Para extender:
 *  - Permitir subir la imagen del avatar directamente (requiere endpoint multipart)
 *  - Agregar campo de rol (admin / member) con un select adicional
 */

import { useState, useEffect } from "react";
import { usersApi } from "../services/api.js";
import "../styles/management.css";

/** Estado vacío del formulario */
const EMPTY = { name: "", email: "", avatar_url: "" };

export default function UsersPage() {
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [editingId, setEditingId] = useState(null); // null = modo creación
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [formErr,   setFormErr]   = useState(null);
  const [success,   setSuccess]   = useState(null);

  /** Recarga la lista desde el servidor */
  const load = () => {
    setLoading(true);
    usersApi.getAll()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /** Handler genérico: actualiza solo el campo indicado por `key` */
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  /** Carga los datos del usuario en el formulario y lo marca como editando */
  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, avatar_url: u.avatar_url || "" });
    setFormErr(null);
    setSuccess(null);
  };

  /** Vuelve al modo creación y limpia el formulario */
  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY);
    setFormErr(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr(null);
    setSaving(true);
    setSuccess(null);
    try {
      if (editingId) {
        await usersApi.update(editingId, form);
        setSuccess("Usuario actualizado correctamente.");
        setEditingId(null);
        setForm(EMPTY);
      } else {
        await usersApi.create(form);
        setSuccess("Usuario creado correctamente.");
        setForm(EMPTY);
      }
      load();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setFormErr(err.message); // ej. email duplicado (error 23505 del backend)
    } finally {
      setSaving(false);
    }
  };

  /** Elimina con confirmación; avisa si tiene tareas asignadas */
  const handleDelete = async (u) => {
    const msg = u.task_count > 0
      ? `"${u.name}" tiene ${u.task_count} tarea(s) asignada(s). Al eliminar el usuario, esas tareas también se eliminarán. ¿Continuar?`
      : `¿Eliminar el usuario "${u.name}"?`;
    if (!window.confirm(msg)) return;
    try {
      await usersApi.remove(u.id);
      if (editingId === u.id) cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Genera las iniciales de un nombre completo.
   * "Ana García" → "AG", "Juan" → "J"
   */
  const initials = (name) =>
    name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  const isEditing = editingId !== null;

  return (
    <section>
      <div className="page-header">
        <div className="page-header__text">
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">
            {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mgmt-layout">

        {/* ── Tabla de usuarios ── */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Todos los usuarios</span>
          </div>

          {loading ? (
            <div className="loading-screen"><div className="spinner" /><span>Cargando…</span></div>
          ) : error ? (
            <div style={{ padding: "var(--space-5)" }}>
              <p className="error-banner">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">—</div>
              <p>No hay usuarios. Crea uno con el formulario.</p>
            </div>
          ) : (
            <div className="mgmt-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th style={{ textAlign: "right" }}>Tareas</th>
                    <th>Registrado</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    /* Resaltado de fila cuando está en modo edición */
                    <tr
                      key={u.id}
                      style={editingId === u.id
                        ? { background: "var(--color-primary-light)" }
                        : {}}
                    >
                      <td>
                        <div className="user-info">
                          {/* Avatar real o placeholder con iniciales */}
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="user-avatar" />
                          ) : (
                            <span className="user-avatar-placeholder">{initials(u.name)}</span>
                          )}
                          <div className="user-info__name">{u.name}</div>
                        </div>
                      </td>
                      <td><span className="user-info__email">{u.email}</span></td>
                      {/* task_count viene del LEFT JOIN en getAllUsers */}
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                        {u.task_count}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "var(--font-size-xs)" }}>
                        {new Date(u.created_at).toLocaleDateString("es-ES", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                          {/* El botón alterna su etiqueta si esta fila ya está en edición */}
                          <button
                            className="btn btn--secondary btn--sm"
                            onClick={() => editingId === u.id ? cancelEdit() : startEdit(u)}
                          >
                            {editingId === u.id ? "Cancelar" : "Editar"}
                          </button>
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => handleDelete(u)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Formulario lateral (sticky) ── */}
        <div className="side-form">
          <div className="side-form__header">
            {/* El título cambia según el modo */}
            <h2 className="side-form__title">
              {isEditing ? "Editar usuario" : "Nuevo usuario"}
            </h2>
          </div>
          <form className="side-form__body" onSubmit={handleSubmit}>
            {formErr && <p className="error-banner">{formErr}</p>}
            {success && <p className="success-msg">{success}</p>}

            <div className="form-group">
              <label className="form-label" htmlFor="u-name">Nombre completo *</label>
              <input id="u-name" className="form-input" type="text"
                value={form.name} onChange={set("name")}
                placeholder="Ej. Ana García" required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="u-email">Correo electrónico *</label>
              <input id="u-email" className="form-input" type="email"
                value={form.email} onChange={set("email")}
                placeholder="ana@empresa.com" required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="u-avatar">
                URL de avatar{" "}
                <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-muted)" }}>
                  (opcional)
                </span>
              </label>
              <input id="u-avatar" className="form-input" type="url"
                value={form.avatar_url} onChange={set("avatar_url")}
                placeholder="https://…" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear usuario"}
              </button>
              {/* Botón de cancelar edición — solo aparece en modo edición */}
              {isEditing && (
                <button type="button" className="btn btn--ghost" onClick={cancelEdit}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
