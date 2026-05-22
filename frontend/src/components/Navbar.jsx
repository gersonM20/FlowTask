import "../styles/navbar.css";

export default function Navbar({ darkMode, onToggleDark }) {
  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__brand-icon">✓</span>
        TaskManager
      </div>

      <div className="navbar__actions">
        <button
          className="navbar__dark-toggle"
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
