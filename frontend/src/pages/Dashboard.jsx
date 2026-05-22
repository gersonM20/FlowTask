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

// Mini-hook local para usuarios: lo definimos aquí en lugar de un archivo separado
// porque solo se usa en esta página y no justifica un archivo propio.
function useUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getAll()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { users, loading };
}

// Página principal del dashboard.
// Orquesta todos los componentes y hooks: stats, filtros, lista de tareas y modal.
export default function Dashboard() {
  // Estado del texto de búsqueda (sin debounce, se actualiza en cada tecla)
  const [search,   setSearch]   = useState("");
  // Estado de los filtros desplegables (status, priority, category_id)
  const [filters,  setFilters]  = useState({});
  // Controla la visibilidad del modal de crear/editar
  const [showForm, setShowForm] = useState(false);
  // Si tiene valor, el modal está en modo edición; si es null, en modo creación
  const [editTask, setEditTask] = useState(null);

  // Aplicamos debounce al texto de búsqueda para no llamar a la API en cada pulsación
  const debouncedSearch = useDebounce(search, 400);

  // Combinamos los filtros de los selects con el texto de búsqueda debounced
  const activeFilters = {
    ...filters,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  // Hook principal: carga tareas cada vez que cambian los filtros activos
  const {
    tasks, loading: tasksLoading, error: tasksError,
    createTask, updateTask, deleteTask,
  } = useTasks(activeFilters);

  // Hook separado para los KPIs: se refresca manualmente tras crear/editar/borrar
  const { stats, loading: statsLoading, refetch: refetchStats } = useTaskStats();

  const { categories } = useCategories();
  const { users }      = useUsers();

  // ─── Handlers ────────────────────────────────────────────────────────────

  // Guarda una tarea nueva o actualizada y refresca los KPIs del header
  const handleSave = async (data) => {
    if (editTask) {
      await updateTask(editTask.id, data);
    } else {
      await createTask(data);
    }
    refetchStats(); // los conteos pueden haber cambiado
  };

  // Pide confirmación antes de eliminar (window.confirm es suficiente para un portafolio)
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta tarea?")) return;
    await deleteTask(id);
    refetchStats();
  };

  // Alterna entre "completed" y "pending" con un solo clic
  const handleToggleStatus = async (task) => {
    const next = task.status === "completed" ? "pending" : "completed";
    await updateTask(task.id, { status: next });
    refetchStats();
  };

  const openEdit  = (task) => { setEditTask(task); setShowForm(true); };
  const closeForm = ()     => { setShowForm(false); setEditTask(null); };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section aria-label="Dashboard de tareas">
      <h1 style={{
        fontSize: "1.5rem",
        fontWeight: 700,
        marginBottom: "var(--space-6)",
        color: "var(--text-primary)",
      }}>
        Dashboard
      </h1>

      {/* Fila de tarjetas KPI */}
      <StatsCard stats={stats} loading={statsLoading} />

      {/* Barra de herramientas: búsqueda + filtros + botón nueva tarea */}
      <div className="dashboard-toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <TaskFilters
          filters={filters}
          categories={categories}
          onFilter={setFilters}
          onAdd={() => { setEditTask(null); setShowForm(true); }}
        />
      </div>

      {/* Banner de error si la carga de tareas falla */}
      {tasksError && (
        <div className="error-message" style={{ marginBottom: "var(--space-4)" }}>
          Error al cargar las tareas: {tasksError}
        </div>
      )}

      {/* Lista de tareas con tres estados posibles: cargando / vacío / con datos */}
      {tasksLoading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <span>Cargando tareas…</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <p>No se encontraron tareas. Ajusta los filtros o crea una nueva.</p>
        </div>
      ) : (
        <div className="task-list" role="list">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Modal de crear/editar: solo se monta cuando showForm es true */}
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
