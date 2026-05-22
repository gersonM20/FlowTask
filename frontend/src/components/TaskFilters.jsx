/**
 * components/TaskFilters.jsx — Tres selects para filtrar tareas
 *
 * Renderiza los filtros de estado, prioridad y categoría como un fragmento
 * (sin div contenedor) para que el padre controle la disposición en flex/grid.
 *
 * Patrón de handler genérico:
 *   handle("status")(e) → onFilter({ ...filters, status: e.target.value })
 * Esto evita duplicar tres funciones idénticas. El valor "" actúa como
 * "sin filtro" y el backend lo ignora al construir la WHERE dinámica.
 *
 * Para extender:
 *  - Agregar filtro de usuario asignado con otro select
 *  - Agregar filtro de fecha (from/to) con inputs de tipo date
 *  - Envolver en un <form> con botón "Aplicar" si se necesita filtrado bajo demanda
 */

import "../styles/filters.css";

/**
 * @param {object}   filters    - Estado actual de filtros: { status, priority, category_id }
 * @param {Array}    categories - Lista de categorías para poblar el tercer select
 * @param {function} onFilter   - Callback que recibe el nuevo objeto de filtros completo
 */
export default function TaskFilters({ filters, categories, onFilter }) {
  /** Genera un handler de cambio para la clave `key` del objeto filters */
  const handle = (key) => (e) => onFilter({ ...filters, [key]: e.target.value });

  return (
    <>
      {/* Filtro por estado — "" = todos */}
      <select className="filter-select" value={filters.status || ""} onChange={handle("status")}>
        <option value="">Todos los estados</option>
        <option value="pending">Pendiente</option>
        <option value="in_progress">En progreso</option>
        <option value="completed">Completada</option>
        <option value="cancelled">Cancelada</option>
      </select>

      {/* Filtro por prioridad — "" = todas */}
      <select className="filter-select" value={filters.priority || ""} onChange={handle("priority")}>
        <option value="">Todas las prioridades</option>
        <option value="urgent">Urgente</option>
        <option value="high">Alta</option>
        <option value="medium">Media</option>
        <option value="low">Baja</option>
      </select>

      {/* Filtro por categoría — opciones dinámicas desde la BD */}
      <select className="filter-select" value={filters.category_id || ""} onChange={handle("category_id")}>
        <option value="">Todas las categorías</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </>
  );
}
