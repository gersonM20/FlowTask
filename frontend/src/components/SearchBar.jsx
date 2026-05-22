import "../styles/filters.css";

// Barra de búsqueda controlada.
// El componente padre (Dashboard) aplica debounce al valor antes de enviarlo a la API,
// por eso este componente simplemente reporta cada cambio de inmediato.
export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      {/* Ícono decorativo, oculto para lectores de pantalla */}
      <span className="search-bar__icon" aria-hidden>🔍</span>

      <input
        className="search-bar__input"
        type="search"
        placeholder="Buscar tareas…"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Buscar tareas"
      />
    </div>
  );
}
