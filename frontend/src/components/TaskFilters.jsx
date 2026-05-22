import "../styles/filters.css";

export default function TaskFilters({ filters, categories, onFilter, onAdd }) {
  const handle = (key) => (e) => onFilter({ ...filters, [key]: e.target.value });

  return (
    <>
      <select className="filter-select" value={filters.status || ""} onChange={handle("status")} aria-label="Filter by status">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select className="filter-select" value={filters.priority || ""} onChange={handle("priority")} aria-label="Filter by priority">
        <option value="">All priorities</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select className="filter-select" value={filters.category_id || ""} onChange={handle("category_id")} aria-label="Filter by category">
        <option value="">All categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className="dashboard-toolbar__right">
        <button className="btn--add" onClick={onAdd}>
          ＋ New Task
        </button>
      </div>
    </>
  );
}
