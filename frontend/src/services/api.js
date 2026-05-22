// URL base de la API. En desarrollo usa el proxy de Vite (/api → localhost:3001).
// En producción se puede sobreescribir con la variable de entorno VITE_API_URL.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Función central de fetch: todos los llamados a la API pasan por aquí.
// Centralizar el fetch permite manejar errores y headers en un solo lugar.
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  // Si el servidor responde con un código de error, lanzamos una excepción
  // con el mensaje que vino del backend (ej. "Tarea no encontrada")
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  // 204 No Content (ej. DELETE exitoso) → no hay cuerpo que parsear
  if (res.status === 204) return null;

  return res.json();
}

// ─── API de Tareas ────────────────────────────────────────────────────────────
export const tasksApi = {
  // Construye el query string solo con los parámetros que tienen valor
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
    ).toString();
    return request(`/tasks${qs ? `?${qs}` : ""}`);
  },

  getStats: ()          => request("/tasks/stats"),
  getById:  (id)        => request(`/tasks/${id}`),
  create:   (data)      => request("/tasks",       { method: "POST",   body: JSON.stringify(data) }),
  update:   (id, data)  => request(`/tasks/${id}`, { method: "PATCH",  body: JSON.stringify(data) }),
  remove:   (id)        => request(`/tasks/${id}`, { method: "DELETE" }),
};

// ─── API de Categorías ────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => request("/categories"),
};

// ─── API de Usuarios ─────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => request("/users"),
};
