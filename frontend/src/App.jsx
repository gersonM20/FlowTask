import { useState } from "react";
import Navbar    from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`app-root${darkMode ? " dark" : ""}`}>
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
      <main className="app-main">
        <Dashboard />
      </main>
    </div>
  );
}
