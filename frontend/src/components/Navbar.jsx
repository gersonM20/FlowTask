/**
 * components/Navbar.jsx — Barra de navegación superior
 *
 * Recibe la página activa y el estado del tema desde App.jsx.
 * No mantiene estado propio (componente controlado).
 *
 * Para agregar una nueva sección:
 *  1. Agregar un objeto { key, label } al array NAV_ITEMS
 *  2. Crear la página correspondiente en src/pages/
 *  3. Registrarla en el objeto PAGES de App.jsx
 */

import DarkModeToggle from "./DarkModeToggle.jsx";
import "../styles/navbar.css";

/**
 * Definición de las secciones de navegación.
 * `key` debe coincidir exactamente con las claves del objeto PAGES en App.jsx.
 */
const NAV_ITEMS = [
  { key: "dashboard",  label: "Dashboard"  },
  { key: "tasks",      label: "Tareas"     },
  { key: "users",      label: "Usuarios"   },
  { key: "categories", label: "Categorías" },
];

/**
 * @param {string}   page         - Clave de la página activa
 * @param {function} onNavigate   - Callback para cambiar de página
 * @param {boolean}  darkMode     - Estado actual del tema
 * @param {function} onToggleDark - Callback para alternar el tema
 */
export default function Navbar({ page, onNavigate, darkMode, onToggleDark }) {
  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">

      {/* Marca / logo */}
      <div className="navbar__brand">
        <span className="navbar__brand-mark" aria-hidden>T</span>
        TaskManager
      </div>

      {/* Vínculos de sección */}
      <div className="navbar__nav" role="menubar">
        {NAV_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            role="menuitem"
            className={`navbar__nav-link${page === key ? " navbar__nav-link--active" : ""}`}
            onClick={() => onNavigate(key)}
            aria-current={page === key ? "page" : undefined}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Toggle de tema */}
      <div className="navbar__actions">
        <DarkModeToggle darkMode={darkMode} onToggle={onToggleDark} />
      </div>

    </nav>
  );
}
