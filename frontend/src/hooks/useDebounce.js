/**
 * hooks/useDebounce.js — Retrasa la actualización de un valor
 *
 * Problema que resuelve:
 *  Sin debounce, cada pulsación de tecla en el buscador lanzaría una petición
 *  a la API. Con debounce, la petición solo se lanza cuando el usuario deja de
 *  escribir durante `delay` milisegundos.
 *
 * Funcionamiento:
 *  1. Cada vez que `value` cambia, se programa un setTimeout
 *  2. Si `value` vuelve a cambiar antes de que pase `delay`, el timer
 *     anterior se cancela (clearTimeout) y se crea uno nuevo
 *  3. Solo cuando el usuario deja de escribir, el setTimeout completa
 *     y actualiza el valor debounced
 *
 * Uso:
 *  const debouncedSearch = useDebounce(searchText, 400);
 *  // debouncedSearch se actualiza 400ms después del último cambio
 *
 * @param {any}    value - Valor a "debouncear"
 * @param {number} delay - Milisegundos de espera (defecto: 400)
 * @returns {any} El valor retrasado
 */

import { useState, useEffect } from "react";

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    // La función de limpieza cancela el timer si value cambia antes de que expire
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
