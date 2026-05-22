import "../styles/navbar.css";

// Barra de navegación superior fija.
// Recibe el estado del modo oscuro y la función para alternarlo desde App.jsx.
export default function Navbar({ darkMode, onToggleDark }) {
  return (
    <nav className="navbar">
      {/* Logo y nombre de la aplicación */}
      <div className="navbar__brand">
        <span className="navbar__brand-icon">✓</span>
        TaskManager
      </div>

      <div className="navbar__actions">
        {/* Botón para alternar entre modo claro y oscuro */}
        <button
          className="navbar__dark-toggle"
          onClick={onToggleDark}
          aria-label="Alternar modo oscuro"
          title={darkMode ? "Modo claro" : "Modo oscuro"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
