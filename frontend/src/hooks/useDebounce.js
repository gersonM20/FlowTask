import { useState, useEffect } from "react";

// Hook de debounce: retrasa la actualización del valor hasta que el usuario
// deje de escribir durante `delay` milisegundos.
// Se usa en la barra de búsqueda para no lanzar una petición a la API
// en cada pulsación de tecla, sino solo cuando el usuario hace una pausa.
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Programamos la actualización del valor
    const timer = setTimeout(() => setDebounced(value), delay);

    // Si el valor cambia antes de que pase el delay, cancelamos el timer anterior
    // y empezamos uno nuevo (esto es el "debounce")
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
