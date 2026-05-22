/**
 * pages/Dashboard.jsx — Vista principal con KPIs y lista de tareas
 *
 * Orquesta tres fuentes de datos:
 *  1. useTasks(activeFilters)  — lista de tareas filtrada + mutaciones
 *  2. useTaskStats()           — conteos KPI (se refresca tras cada mutación)
 *  3. useCategories()          — para el select del formulario y los filtros
 *  4. useUsers() (inline)      — para el select de asignación del formulario
 *
 * Flujo de búsqueda con debounce:
 *   [input] → search → useDebounce(400ms) → debouncedSearch → activeFilters
 *   Solo cuando el usuario deja de escribir 400 ms se envía la petición GET.
 *
 * Manejo de modal:
 *  - showForm + editTask=null  → crear tarea nueva
 *  - showForm + editTask=obj   → editar tarea existente
 *
 * Para extender:
 *  - Agregar paginación: pasar page/pageSize a useTasks y mostrar controles
 *  - Agregar ordenamiento: botones en la toolbar que cambian un campo sort
 *  - Extraer useUsers a hooks/useUsers.js si se reutiliza en más páginas
 */

import { useState, useEffect } from "react";
import StatsCard   from "../components/StatsCard.jsx";
import SearchBar   from "../components/SearchBar.jsx";
import TaskFilters from "../components/TaskFilters.jsx";
import TaskCard    from "../components/TaskCard.jsx";
import TaskForm    from "../components/TaskForm.jsx";
import { useTasks, useTaskStats } from "../hooks/useTasks.js";
import { useCategories }          from "../hooks/useCategories.js";
import { useDebounce }            from "../hooks/useDebounce.js";
import { usersApi }               from "../services/api.js";
import "../styles/dashboard.css";

/**
 * Hook local para cargar la lista de usuarios.
 * Se define aquí porque solo se necesita en las páginas con TaskForm.
 * Si se reutiliza, moverlo a hooks/useUsers.js.
 */
function useUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(console.error).finally(() => setLoading(false));
  }, []);
  return { users, loading };
}

export default function Dashboard() {
  const [search,   setSearch]   = useState("");
  const [filters,  setFilters]  = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  // Combina filtros de los selects con la búsqueda de texto
  // Si no hay búsqueda, no se incluye el campo para evitar parámetro vacío
  const activeFilters = {
    ...filters,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const { tasks, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask } = useTasks(activeFilters);
  const { stats, loading: statsLoading, refetch: refetchStats } = useTaskStats();
  const { categories } = useCategories();
  const { users }      = useUsers();

  /** Crea o actualiza según si hay una tarea en edición, luego refresca los KPIs */
  const handleSave = async (data) => {
    if (editTask) await updateTask(editTask.id, data);
    else          await createTask(data);
    refetchStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    await deleteTask(id);
    refetchStats();
  };

  /** Alterna entre "completed" y "pending" con un solo clic */
  const handleToggle = async (task) => {
    const next = task.status === "completed" ? "pending" : "completed";
    await updateTask(task.id, { status: next });
    refetchStats();
  };

  const openEdit  = (task) => { setEditTask(task); setShowForm(true); };
  const closeForm = ()     => { setShowForm(false); setEditTask(null); };

  return (
    <section>
      <div className="page-header">
        <div className="page-header__text">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general de tareas</p>
        </div>
        <button className="btn btn--primary" onClick={() => { setEditTask(null); setShowForm(true); }}>
          + Nueva tarea
        </button>
      </div>

      {/* Fila de KPIs — se refrescan después de cada mutación */}
      <StatsCard stats={stats} loading={statsLoading} />

      {/* Toolbar: búsqueda + filtros + botón limpiar (condicional) */}
      <div className="dashboard-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar tareas…" />
        <TaskFilters filters={filters} categories={categories} onFilter={setFilters} />
        <div className="dashboard-toolbar__spacer" />
        {/* Solo aparece cuando hay al menos un filtro activo */}
        {(filters.status || filters.priority || filters.category_id || search) && (
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => { setFilters({}); setSearch(""); }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Error de red — no bloquea la UI, solo informa */}
      {tasksError && <p className="error-banner" style={{ marginBottom: "var(--space-4)" }}>{tasksError}</p>}

      {/* Estados: cargando / vacío / lista */}
      {tasksLoading ? (
        <div className="loading-screen"><div className="spinner" /><span>Cargando tareas…</span></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">≡</div>
          <h3 style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-1)" }}>Sin resultados</h3>
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

      {/* Modal de creación/edición — se monta solo cuando showForm es true */}
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
