/**
 * pages/UsersPage.jsx — Gestión de usuarios (solo creación)
 *
 * Layout de dos columnas:
 *  - Izquierda: tabla con todos los usuarios y sus métricas (task_count)
 *  - Derecha: formulario sticky para crear un usuario nuevo
 *
 * Flujo post-creación:
 *  1. API guarda el usuario
 *  2. setForm(EMPTY) limpia el formulario
 *  3. load() recarga la lista para mostrar el nuevo registro
 *  4. setSuccess(true) muestra el mensaje verde 3 segundos
 *
 * Avatar:
 *  - Si el usuario tiene avatar_url, se muestra la imagen
 *  - Si no, se muestra un placeholder con las iniciales (máx. 2)
 *    calculadas por la función initials()
 *
 * Para extender:
 *  - Agregar botón "Editar" por fila (igual que CategoriesPage)
 *  - Agregar botón "Eliminar" (requiere confirmar si tiene tareas asignadas)
 *  - Permitir subir la imagen del avatar directamente desde el formulario
 */

import { useState, useEffect } from "react";
import { usersApi } from "../services/api.js";
import "../styles/management.css";

/** Estado vacío del formulario */
const EMPTY = { name: "", email: "", avatar_url: "" };

export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [formErr, setFormErr] = useState(null);
  const [success, setSuccess] = useState(false);

  /** Recarga la lista desde el servidor; se llama al montar y tras crear */
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErr(null);
    setSaving(true);
    setSuccess(false);
    try {
      await usersApi.create(form);
      setForm(EMPTY);
      setSuccess(true);
      load(); // refresca la tabla para ver el nuevo usuario
      setTimeout(() => setSuccess(false), 3000); // oculta el mensaje tras 3s
    } catch (err) {
      setFormErr(err.message); // muestra el error del backend (ej. email duplicado)
    } finally {
      setSaving(false);
    }
  };

  /**
   * Genera las iniciales de un nombre completo.
   * "Ana García" → "AG", "Juan" → "J"
   */
  const initials = (name) =>
    name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

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

      {/* Layout de dos columnas: tabla + formulario lateral */}
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
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
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
            <h2 className="side-form__title">Nuevo usuario</h2>
          </div>
          <form className="side-form__body" onSubmit={handleSubmit}>
            {formErr  && <p className="error-banner">{formErr}</p>}
            {success  && <p className="success-msg">Usuario creado correctamente.</p>}

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
                {/* Estilo inline para el texto "(opcional)" — diferente al label */}
                <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-muted)" }}>
                  (opcional)
                </span>
              </label>
              <input id="u-avatar" className="form-input" type="url"
                value={form.avatar_url} onChange={set("avatar_url")}
                placeholder="https://…" />
            </div>

            <button type="submit" className="btn btn--primary" style={{ width: "100%" }} disabled={saving}>
              {saving ? "Guardando…" : "Crear usuario"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
