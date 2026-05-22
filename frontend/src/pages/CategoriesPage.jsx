/**
 * pages/CategoriesPage.jsx — Gestión completa de categorías (CRUD)
 *
 * Layout de dos columnas:
 *  - Izquierda: tabla con nombre, conteo de tareas y color
 *  - Derecha: formulario sticky que alterna entre "crear" y "editar"
 *
 * Flujo de edición:
 *  1. Usuario hace clic en "Editar" → startEdit(cat) carga los datos en el form
 *     y guarda editingId; la fila se resalta con color primario claro
 *  2. Usuario modifica y hace submit → updateCategory(editingId, form)
 *  3. Se llama a load() para refrescar la tabla y se limpia editingId
 *
 * Flujo de eliminación:
 *  - Si la categoría tiene tareas, el confirm muestra una advertencia explícita
 *    porque el ON DELETE SET NULL del backend dejará esas tareas sin categoría
 *
 * Paleta de colores:
 *  - 10 colores fijos cuidadosamente elegidos para contraste sobre fondo blanco
 *  - El chip de "Vista previa" se actualiza en tiempo real al cambiar nombre o color
 *
 * Para extender:
 *  - Permitir colores hex personalizados con un <input type="color">
 *  - Agregar descripción a las categorías (requiere nueva columna en BD)
 *  - Agregar drag & drop para reordenar categorías
 */

import { useState, useEffect } from "react";
import { categoriesApi } from "../services/api.js";
import "../styles/management.css";

/**
 * Paleta de 10 colores usados en los chips de categoría.
 * Todos tienen contraste suficiente para texto blanco encima.
 */
const PALETTE = [
  "#2563eb","#7c3aed","#db2777","#dc2626",
  "#ea580c","#d97706","#059669","#0891b2",
  "#475569","#1e293b",
];

/** Estado inicial del formulario */
const EMPTY = { name: "", color: PALETTE[0] };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [editingId,  setEditingId]  = useState(null); // null = modo creación
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [formErr,    setFormErr]    = useState(null);
  const [success,    setSuccess]    = useState(null);

  /** Recarga la lista desde el servidor */
  const load = () => {
    setLoading(true);
    categoriesApi.getAll()
      .then(setCategories)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  /** Handler genérico para campos de texto */
  const set      = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  /** Handler específico para el selector de color (recibe el string hex directo) */
  const setColor = (color)      => setForm(f => ({ ...f, color }));

  /** Carga los datos de la categoría en el formulario y la marca como editando */
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, color: cat.color });
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
        await categoriesApi.update(editingId, form);
        setSuccess("Categoría actualizada correctamente.");
        setEditingId(null);
        setForm(EMPTY);
      } else {
        await categoriesApi.create(form);
        setSuccess("Categoría creada correctamente.");
        setForm(EMPTY); // mantener el color seleccionado como default para la próxima
      }
      load();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setFormErr(err.message); // ej. nombre duplicado (error 23505 del backend)
    } finally {
      setSaving(false);
    }
  };

  /** Elimina con confirmación; avisa si hay tareas asociadas */
  const handleDelete = async (cat) => {
    const msg = cat.task_count > 0
      ? `"${cat.name}" tiene ${cat.task_count} tarea(s) asociada(s). Las tareas quedarán sin categoría. ¿Continuar?`
      : `¿Eliminar la categoría "${cat.name}"?`;
    if (!window.confirm(msg)) return;
    try {
      await categoriesApi.remove(cat.id);
      // Si se estaba editando esta categoría, limpiar el formulario
      if (editingId === cat.id) cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const isEditing = editingId !== null;

  return (
    <section>
      <div className="page-header">
        <div className="page-header__text">
          <h1 className="page-title">Categorías</h1>
          <p className="page-subtitle">
            {categories.length} categoría{categories.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="mgmt-layout">

        {/* ── Tabla de categorías ── */}
        <div className="card">
          <div className="card__header">
            <span className="card__title">Todas las categorías</span>
          </div>

          {loading ? (
            <div className="loading-screen"><div className="spinner" /><span>Cargando…</span></div>
          ) : error ? (
            <div style={{ padding: "var(--space-5)" }}>
              <p className="error-banner">{error}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">—</div>
              <p>No hay categorías. Crea una con el formulario.</p>
            </div>
          ) : (
            <div className="mgmt-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th style={{ textAlign: "right" }}>Tareas</th>
                    <th>Color</th>
                    <th style={{ textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    /* Resaltado de fila cuando está en modo edición */
                    <tr
                      key={c.id}
                      style={editingId === c.id
                        ? { background: "var(--color-primary-light)" }
                        : {}}
                    >
                      <td>
                        {/* Chip con el color real de la categoría */}
                        <span className="category-chip" style={{ background: c.color }}>
                          {c.name}
                        </span>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                        {c.task_count}
                      </td>
                      <td>
                        {/* Valor hex en fuente monoespaciada */}
                        <span style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}>
                          {c.color}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
                          {/* El botón alterna su etiqueta si esta fila ya está en edición */}
                          <button
                            className="btn btn--secondary btn--sm"
                            onClick={() => editingId === c.id ? cancelEdit() : startEdit(c)}
                          >
                            {editingId === c.id ? "Cancelar" : "Editar"}
                          </button>
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => handleDelete(c)}
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
              {isEditing ? "Editar categoría" : "Nueva categoría"}
            </h2>
          </div>

          <form className="side-form__body" onSubmit={handleSubmit}>
            {formErr  && <p className="error-banner">{formErr}</p>}
            {success  && <p className="success-msg">{success}</p>}

            <div className="form-group">
              <label className="form-label" htmlFor="c-name">Nombre *</label>
              <input id="c-name" className="form-input" type="text"
                value={form.name} onChange={set("name")}
                placeholder="Ej. Backend" required />
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              {/* Selector de color: botones con la clase --active en el color seleccionado */}
              <div className="color-picker">
                {PALETTE.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch${form.color === color ? " color-swatch--active" : ""}`}
                    style={{ background: color }}
                    onClick={() => setColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Vista previa en tiempo real — solo visible cuando hay nombre */}
            {form.name && (
              <div>
                <p className="form-label" style={{ marginBottom: "var(--space-2)" }}>Vista previa</p>
                <span className="category-chip" style={{ background: form.color }}>
                  {form.name}
                </span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear categoría"}
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
