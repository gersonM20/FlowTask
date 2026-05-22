import { useState } from "react";
import Navbar    from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// Componente raíz de la aplicación.
// Gestiona el estado global de dark mode y lo aplica como clase CSS en el div raíz.
// Las variables CSS definidas en variables.css cambian automáticamente con la clase .dark.
export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    // La clase "dark" activa las variables CSS del tema oscuro (ver variables.css)
    <div className={`app-root${darkMode ? " dark" : ""}`}>
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  );
}
