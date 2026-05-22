/**
 * App.jsx — Componente raíz de la aplicación
 *
 * Responsabilidades:
 *  - Mantener el estado global de la página activa (navegación)
 *  - Mantener el estado global del tema (claro / oscuro)
 *  - Sincronizar la clase "dark" en <html> para que body y todos
 *    los elementos hereden las variables CSS del modo oscuro
 *
 * Para agregar una nueva sección:
 *  1. Crear la página en src/pages/NuevaPagina.jsx
 *  2. Importarla aquí
 *  3. Agregar la clave al objeto PAGES
 *  4. Agregar la entrada en NAV_ITEMS de Navbar.jsx
 *
 * Nota sobre el dark mode:
 *  La clase se aplica en document.documentElement (<html>), no en el div raíz,
 *  porque las variables CSS heredan hacia los hijos, nunca hacia los padres.
 *  Si se aplicara en el div, el body quedaría fuera del alcance.
 */

import { useState, useEffect } from "react";
import Navbar         from "./components/Navbar.jsx";
import Dashboard      from "./pages/Dashboard.jsx";
import TasksPage      from "./pages/TasksPage.jsx";
import UsersPage      from "./pages/UsersPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";

/**
 * Mapa de páginas disponibles.
 * La clave coincide con el valor de `page` en el navbar.
 * Agregar una nueva página aquí es suficiente — Navbar.jsx la mostrará
 * automáticamente si se agrega también en NAV_ITEMS.
 */
const PAGES = {
  dashboard:  <Dashboard />,
  tasks:      <TasksPage />,
  users:      <UsersPage />,
  categories: <CategoriesPage />,
};

export default function App() {
  const [page,     setPage]     = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);

  /**
   * Sincroniza el modo oscuro con el elemento <html>.
   * Se ejecuta cada vez que darkMode cambia.
   * classList.toggle(clase, boolean) agrega la clase si true, la quita si false.
   */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="app-root">
      <Navbar
        page={page}
        onNavigate={setPage}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
      <main className="app-main">
        {/* Renderiza solo la página activa */}
        {PAGES[page]}
      </main>
    </div>
  );
}
