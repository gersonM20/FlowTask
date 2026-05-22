/**
 * pages/TasksPage.jsx — Vista dedicada a la gestión de tareas
 *
 * Funciona igual que Dashboard pero sin las tarjetas KPI. Ideal para
 * operaciones de mantenimiento masivo (filtrar, editar, eliminar).
 *
 * Diferencias respecto a Dashboard:
 *  - No usa useTaskStats() porque no hay KPIs que refrescar
 *  - El subtítulo muestra el conteo de resultados activos
 *  - useUsers() devuelve directamente el array (sin loading) para simplificar
 *
 * Para extender:
 *  - Agregar vista en tabla (alternar lista/tabla con un toggle)
 *  - Agregar selección múltiple + acción en lote (p.ej. completar todas)
 *  - Agregar ordenamiento por columna
 */

import { useState, useEffect } from "react";
import SearchBar   from "../components/SearchBar.jsx";
import TaskFilters from "../components/TaskFilters.jsx";
import TaskCard    from "../components/TaskCard.jsx";
import TaskForm    from "../components/TaskForm.jsx";
import { useTasks }      from "../hooks/useTasks.js";
import { useCategories } from "../hooks/useCategories.js";
import { useDebounce }   from "../hooks/useDebounce.js";
import { usersApi }      from "../services/api.js";
import "../styles/dashboard.css";

/** Carga usuarios una sola vez al montar; sin estado de loading porque no hay spinner aquí */
function useUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { usersApi.getAll().then(setUsers).catch(console.error); }, []);
  return users;
}

export default function TasksPage() {
  const [search,   setSearch]   = useState("");
  const [filters,  setFilters]  = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const activeFilters   = { ...filters, ...(debouncedSearch ? { search: debouncedSearch } : {}) };

  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks(activeFilters);
  const { categories } = useCategories();
  const users = useUsers();

  const handleSave = async (data) => {
    if (editTask) await updateTask(editTask.id, data);
    else          await createTask(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    await deleteTask(id);
  };

  /** Alterna entre "completed" y "pending" */
  const handleToggle = async (task) => {
    const next = task.status === "completed" ? "pending" : "completed";
    await updateTask(task.id, { status: next });
  };

  const openEdit  = (task) => { setEditTask(task); setShowForm(true); };
  const closeForm = ()     => { setShowForm(false); setEditTask(null); };

  return (
    <section>
      <div className="page-header">
        <div className="page-header__text">
          <h1 className="page-title">Tareas</h1>
          {/* Subtítulo dinámico: "1 tarea" / "N tareas" */}
          <p className="page-subtitle">{tasks.length} tarea{tasks.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn--primary" onClick={() => { setEditTask(null); setShowForm(true); }}>
          + Nueva tarea
        </button>
      </div>

      <div className="dashboard-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar tareas…" />
        <TaskFilters filters={filters} categories={categories} onFilter={setFilters} />
        <div className="dashboard-toolbar__spacer" />
        {(filters.status || filters.priority || filters.category_id || search) && (
          <button className="btn btn--ghost btn--sm" onClick={() => { setFilters({}); setSearch(""); }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {error && <p className="error-banner" style={{ marginBottom: "var(--space-4)" }}>{error}</p>}

      {loading ? (
        <div className="loading-screen"><div className="spinner" /><span>Cargando…</span></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">≡</div>
          <h3 style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Sin resultados</h3>
          <p>No hay tareas con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="task-list" role="list">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggle}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editTask}
          categories={categories}
          users={users}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </section>
  );
}
