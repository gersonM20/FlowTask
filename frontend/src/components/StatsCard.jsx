import "../styles/dashboard.css";

// Configuración de los KPIs a mostrar.
// Centralizar esto aquí hace fácil agregar o quitar métricas sin tocar el JSX.
const STATS_CONFIG = [
  { key: "total",       label: "Total",         color: "#6366f1" },
  { key: "pending",     label: "Pendientes",    color: "#f59e0b" },
  { key: "in_progress", label: "En Progreso",   color: "#3b82f6" },
  { key: "completed",   label: "Completadas",   color: "#10b981" },
  { key: "overdue",     label: "Vencidas",      color: "#ef4444" },
];

// Componente que renderiza la fila de tarjetas KPI del dashboard.
// Muestra "—" mientras cargan los datos para evitar mostrar ceros falsos.
export default function StatsCard({ stats, loading }) {
  return (
    <div className="stats-grid">
      {STATS_CONFIG.map(({ key, label, color }) => (
        <div key={key} className="stat-card">
          {/* Punto de color identificador de la métrica */}
          <span className="stat-card__dot" style={{ background: color }} />

          {/* Valor numérico: "—" durante la carga, 0 si no hay datos */}
          <span className="stat-card__value">
            {loading ? "—" : (stats?.[key] ?? 0)}
          </span>

          <span className="stat-card__label">{label}</span>
        </div>
      ))}
    </div>
  );
}
