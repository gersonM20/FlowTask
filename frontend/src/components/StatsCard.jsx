import "../styles/dashboard.css";

const STATS_CONFIG = [
  { key: "total",       label: "Total",       color: "#6366f1" },
  { key: "pending",     label: "Pending",     color: "#f59e0b" },
  { key: "in_progress", label: "In Progress", color: "#3b82f6" },
  { key: "completed",   label: "Completed",   color: "#10b981" },
  { key: "overdue",     label: "Overdue",     color: "#ef4444" },
];

export default function StatsCard({ stats, loading }) {
  return (
    <div className="stats-grid">
      {STATS_CONFIG.map(({ key, label, color }) => (
        <div key={key} className="stat-card">
          <span className="stat-card__dot" style={{ background: color }} />
          <span className="stat-card__value">
            {loading ? "—" : (stats?.[key] ?? 0)}
          </span>
          <span className="stat-card__label">{label}</span>
        </div>
      ))}
    </div>
  );
}
