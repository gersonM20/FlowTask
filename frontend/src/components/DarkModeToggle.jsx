/**
 * components/DarkModeToggle.jsx — Interruptor animado de tema claro/oscuro
 *
 * Diseño:
 *  - Pill de 52×28 px con un knob deslizante
 *  - Modo claro: knob a la izquierda con ícono de luna
 *  - Modo oscuro: knob a la derecha con ícono de sol giratorio
 *  - Estrellas parpadeantes en la pista (solo en modo oscuro)
 *  - Transición spring (cubic-bezier con rebote) en el deslizamiento
 *
 * Accesibilidad:
 *  - role="switch" + aria-pressed comunica el estado a lectores de pantalla
 *  - aria-label describe la acción del botón
 *  - :focus-visible muestra el anillo de foco solo con teclado
 *
 * Para extender:
 *  - Cambiar el delay de las animaciones en darkToggle.css
 *  - Agregar sonido de clic con un AudioContext de 50ms
 *  - Persistir la preferencia en localStorage y leerla al iniciar
 */

import "../styles/darkToggle.css";

/** Ícono de sol con 8 rayos que giran lentamente */
function SunIcon() {
  return (
    <div className="sun-icon" aria-hidden>
      <div className="sun-icon__core" />
      <div className="sun-icon__rays">
        {/* 8 rayos distribuidos en 360° (45° entre cada uno) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="sun-icon__ray"
            style={{ transform: `rotate(${i * 45}deg) translateX(-50%)` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Ícono de luna usando SVG path estándar */
function MoonIcon() {
  return (
    <svg className="moon-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {/* Path de luna creciente: círculo con otro círculo recortado */}
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * @param {boolean}  darkMode  - Estado actual del tema
 * @param {function} onToggle  - Callback para alternarlo
 */
export default function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <button
      className={`theme-toggle${darkMode ? " theme-toggle--dark" : ""}`}
      onClick={onToggle}
      role="switch"
      aria-checked={darkMode}
      aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {/* Estrellas decorativas — visibles solo en modo oscuro (controlado por CSS) */}
      <div className="theme-toggle__stars" aria-hidden>
        <div className="theme-toggle__star" />
        <div className="theme-toggle__star" />
        <div className="theme-toggle__star" />
      </div>

      {/* Knob deslizante: contiene ambos íconos, CSS controla cuál es visible */}
      <div className="theme-toggle__knob" aria-hidden>
        <div className="theme-toggle__icon theme-toggle__icon--moon">
          <MoonIcon />
        </div>
        <div className="theme-toggle__icon theme-toggle__icon--sun">
          <SunIcon />
        </div>
      </div>
    </button>
  );
}
