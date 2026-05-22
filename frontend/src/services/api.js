const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  // 204 No Content → return null
  if (res.status === 204) return null;
  return res.json();
}

// ─── Tasks ───────────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
    ).toString();
    return request(`/tasks${qs ? `?${qs}` : ""}`);
  },
  getStats: ()           => request("/tasks/stats"),
  getById:  (id)         => request(`/tasks/${id}`),
  create:   (data)       => request("/tasks",    { method: "POST",  body: JSON.stringify(data) }),
  update:   (id, data)   => request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove:   (id)         => request(`/tasks/${id}`, { method: "DELETE" }),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => request("/categories"),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => request("/users"),
};
