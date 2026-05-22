/**
 * components/StatsCard.jsx — Fila de tarjetas KPI del Dashboard
 *
 * Muestra 5 métricas: total, pendientes, en progreso, completadas y vencidas.
 * Los valores provienen del endpoint GET /api/tasks/stats (hook useTaskStats).
 *
 * Decisiones de diseño:
 *  - La configuración STATS vive aquí (no en el hook) porque es visual: color + etiqueta
 *  - El color-dot es un círculo de 10px definido en global.css; el color viene de STATS
 *  - "—" durante la carga evita el salto de layout que produciría "0"
 *
 * Para extender:
 *  - Agregar sparkline o mini-gráfico por KPI usando una librería como recharts
 *  - Hacer cada card clicable para filtrar las tareas por ese estado
 */

import "../styles/dashboard.css";

/**
 * Configuración de cada tarjeta KPI.
 * `key` debe coincidir con los campos que devuelve getTaskStats en el backend.
 */
const STATS = [
  { key: "total",       label: "Total",       color: "#2563eb" },
  { key: "pending",     label: "Pendientes",  color: "#d97706" },
  { key: "in_progress", label: "En progreso", color: "#7c3aed" },
  { key: "completed",   label: "Completadas", color: "#059669" },
  { key: "overdue",     label: "Vencidas",    color: "#dc2626" },
];

/**
 * @param {object|null} stats   - Objeto con conteos por clave (del hook useTaskStats)
 * @param {boolean}     loading - Si true, muestra "—" en lugar del número
 */
export default function StatsCard({ stats, loading }) {
  return (
    <div className="stats-grid">
      {STATS.map(({ key, label, color }) => (
        <div key={key} className="stat-card">
          <div className="stat-card__label">
            {/* Punto de color que identifica visualmente cada métrica */}
            <span className="color-dot" style={{ background: color }} />
            {label}
          </div>
          <div className="stat-card__value">
            {/* ?? 0 cubre el caso en que la clave falte en la respuesta */}
            {loading ? "—" : (stats?.[key] ?? 0)}
          </div>
        </div>
      ))}
    </div>
  );
}
