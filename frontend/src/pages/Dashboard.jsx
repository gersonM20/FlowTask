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

// Inline mini-hook: keeps Dashboard self-contained without a separate file
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

export default function Dashboard() {
  const [search,   setSearch]  = useState("");
  const [filters,  setFilters] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const debouncedSearch = useDebounce(search, 400);

  // Merge text search into filters only when non-empty
  const activeFilters = {
    ...filters,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  };

  const {
    tasks, loading: tasksLoading, error: tasksError,
    createTask, updateTask, deleteTask, refetch,
  } = useTasks(activeFilters);

  const { stats, loading: statsLoading, refetch: refetchStats } = useTaskStats();
  const { categories } = useCategories();
  const { users }      = useUsers();

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSave = async (data) => {
    if (editTask) {
      await updateTask(editTask.id, data);
    } else {
      await createTask(data);
    }
    refetchStats();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(id);
    refetchStats();
  };

  const handleToggleStatus = async (task) => {
    const next = task.status === "completed" ? "pending" : "completed";
    await updateTask(task.id, { status: next });
    refetchStats();
  };

  const openEdit  = (task) => { setEditTask(task); setShowForm(true); };
  const closeForm = ()     => { setShowForm(false); setEditTask(null); };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section aria-label="Task dashboard">
      <h1 style={{
        fontSize: "1.5rem",
        fontWeight: 700,
        marginBottom: "var(--space-6)",
        color: "var(--text-primary)",
      }}>
        Dashboard
      </h1>

      {/* KPI cards */}
      <StatsCard stats={stats} loading={statsLoading} />

      {/* Search + filters toolbar */}
      <div className="dashboard-toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <TaskFilters
          filters={filters}
          categories={categories}
          onFilter={setFilters}
          onAdd={() => { setEditTask(null); setShowForm(true); }}
        />
      </div>

      {/* Error banner */}
      {tasksError && (
        <div className="error-message" style={{ marginBottom: "var(--space-4)" }}>
          Failed to load tasks: {tasksError}
        </div>
      )}

      {/* Task list */}
      {tasksLoading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <span>Loading tasks…</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <p>No tasks found. Adjust filters or create a new one.</p>
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

      {/* Create / edit modal */}
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
