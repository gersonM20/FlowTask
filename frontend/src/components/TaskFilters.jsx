import "../styles/filters.css";

// Componente de filtros del dashboard.
// Cada <select> actualiza una clave específica del objeto filters del padre,
// manteniendo los demás filtros activos (spread de filters).
export default function TaskFilters({ filters, categories, onFilter, onAdd }) {

  // Generador de handlers: recibe el nombre del campo y devuelve
  // una función que actualiza solo ese campo en el objeto filters
  const handle = (key) => (e) => onFilter({ ...filters, [key]: e.target.value });

  return (
    <>
      {/* Filtro por estado de la tarea */}
      <select
        className="filter-select"
        value={filters.status || ""}
        onChange={handle("status")}
        aria-label="Filtrar por estado"
      >
        <option value="">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="in_progress">En Progreso</option>
        <option value="completed">Completada</option>
        <option value="cancelled">Cancelada</option>
      </select>

      {/* Filtro por prioridad */}
      <select
        className="filter-select"
        value={filters.priority || ""}
        onChange={handle("priority")}
        aria-label="Filtrar por prioridad"
      >
        <option value="">Todas las prioridades</option>
        <option value="urgent">Urgente</option>
        <option value="high">Alta</option>
        <option value="medium">Media</option>
        <option value="low">Baja</option>
      </select>

      {/* Filtro por categoría — las opciones se cargan dinámicamente desde la API */}
      <select
        className="filter-select"
        value={filters.category_id || ""}
        onChange={handle("category_id")}
        aria-label="Filtrar por categoría"
      >
        <option value="">Todas las categorías</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Botón para abrir el modal de nueva tarea, alineado a la derecha */}
      <div className="dashboard-toolbar__right">
        <button className="btn--add" onClick={onAdd}>
          ＋ Nueva Tarea
        </button>
      </div>
    </>
  );
}
