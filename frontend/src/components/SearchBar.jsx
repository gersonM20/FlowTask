/**
 * components/SearchBar.jsx — Campo de búsqueda con ícono decorativo
 *
 * Componente controlado: no mantiene estado propio, recibe `value` y llama
 * a `onChange` en cada pulsación de tecla. El debounce vive en el componente
 * padre para mantener este componente simple y reutilizable.
 *
 * El ícono ⌕ está posicionado con `position: absolute` dentro del contenedor
 * relativo; el padding-left del input lo desplaza para evitar solapamiento.
 *
 * Para extender:
 *  - Agregar un botón "✕" para limpiar el campo cuando value !== ""
 *  - Agregar atajo de teclado (Ctrl+K / ⌘K) con useEffect + keydown listener
 */

import "../styles/filters.css";

/**
 * @param {string}   value        - Texto actual del input (controlado)
 * @param {function} onChange     - Callback que recibe el string nuevo
 * @param {string}   [placeholder] - Texto placeholder (default "Buscar…")
 */
export default function SearchBar({ value, onChange, placeholder = "Buscar…" }) {
  return (
    <div className="search-bar">
      {/* Ícono decorativo — aria-hidden porque el input ya tiene aria-label */}
      <span className="search-bar__icon" aria-hidden>⌕</span>
      <input
        className="search-bar__input"
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Buscar"
      />
    </div>
  );
}
