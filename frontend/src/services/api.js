/**
 * services/api.js — Capa de comunicación con la API REST
 *
 * Centraliza todos los llamados fetch en un único archivo.
 * Ventajas de este enfoque:
 *  - Un solo lugar para cambiar la URL base o agregar headers (ej. Authorization)
 *  - Manejo uniforme de errores HTTP: cualquier status >= 400 lanza un Error
 *    con el mensaje que vino del backend
 *  - Los componentes y hooks solo llaman a tasksApi.getAll(), etc.
 *    sin conocer detalles de HTTP
 *
 * Para extender:
 *  - Agregar un header "Authorization: Bearer <token>" en request()
 *    cuando se implemente autenticación
 *  - Agregar retry automático en errores de red (status 0 o 503)
 *  - Agregar caché local con Map() para evitar fetches repetidos
 */

/**
 * URL base de la API.
 * En desarrollo Vite redirige /api → localhost:3001 (ver vite.config.js).
 * En producción se puede sobreescribir con la variable VITE_API_URL.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Función central de fetch.
 * Todos los métodos de los objetos api pasan por aquí.
 *
 * @param {string} path   - Ruta relativa a BASE_URL (ej. "/tasks")
 * @param {object} options - Opciones adicionales de fetch (method, body, headers…)
 * @returns {Promise<any>} - JSON de respuesta, o null para 204 No Content
 * @throws {Error} - Con el mensaje de error del backend si status >= 400
 */
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    // Intentar extraer el mensaje de error del cuerpo JSON del backend
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  // 204 No Content (ej. DELETE exitoso) no tiene cuerpo que parsear
  if (res.status === 204) return null;

  return res.json();
}

// ─── API de Tareas ────────────────────────────────────────────────────────────

export const tasksApi = {
  /**
   * Lista tareas con filtros opcionales.
   * Los valores null/undefined/vacíos se excluyen del query string
   * para no enviar parámetros vacíos a la API.
   *
   * @param {object} params - { status, priority, category_id, user_id, search }
   */
  getAll: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== "")
      )
    ).toString();
    return request(`/tasks${qs ? `?${qs}` : ""}`);
  },

  /** Obtiene los KPIs del dashboard (total, pendientes, vencidas, etc.) */
  getStats: ()          => request("/tasks/stats"),

  /** Obtiene una tarea con sus datos de usuario y categoría */
  getById:  (id)        => request(`/tasks/${id}`),

  /** Crea una tarea. Requiere title y user_id en data */
  create:   (data)      => request("/tasks",       { method: "POST",   body: JSON.stringify(data) }),

  /** Actualización parcial: solo actualiza los campos presentes en data */
  update:   (id, data)  => request(`/tasks/${id}`, { method: "PATCH",  body: JSON.stringify(data) }),

  /** Elimina una tarea permanentemente */
  remove:   (id)        => request(`/tasks/${id}`, { method: "DELETE" }),
};

// ─── API de Categorías ────────────────────────────────────────────────────────

export const categoriesApi = {
  /** Lista todas las categorías con su conteo de tareas */
  getAll:  ()         => request("/categories"),

  /** Crea una categoría. Requiere name; color es opcional */
  create:  (data)     => request("/categories",       { method: "POST",   body: JSON.stringify(data) }),

  /** Actualiza nombre y/o color de una categoría */
  update:  (id, data) => request(`/categories/${id}`, { method: "PATCH",  body: JSON.stringify(data) }),

  /** Elimina una categoría (las tareas quedan sin categoría) */
  remove:  (id)       => request(`/categories/${id}`, { method: "DELETE" }),
};

// ─── API de Usuarios ─────────────────────────────────────────────────────────

export const usersApi = {
  /** Lista todos los usuarios con su conteo de tareas */
  getAll:  ()     => request("/users"),

  /** Crea un usuario. Requiere name y email */
  create:  (data) => request("/users", { method: "POST", body: JSON.stringify(data) }),
};
