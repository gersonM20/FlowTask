import "../styles/filters.css";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <span className="search-bar__icon" aria-hidden>🔍</span>
      <input
        className="search-bar__input"
        type="search"
        placeholder="Search tasks…"
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Search tasks"
      />
    </div>
  );
}
