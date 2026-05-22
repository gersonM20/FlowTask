// Carga las variables de entorno desde el archivo .env antes que cualquier otra cosa
require("dotenv").config();

const express = require("express");
const cors    = require("cors");

// Importación de los routers de cada recurso
const tasksRouter      = require("./routes/tasks");
const categoriesRouter = require("./routes/categories");
const usersRouter      = require("./routes/users");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware global ────────────────────────────────────────────────────────

// Permite peticiones desde cualquier origen en desarrollo.
// En producción se debería restringir a la URL del frontend.
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Permite leer el cuerpo de las peticiones como JSON
app.use(express.json());

// Logger de peticiones: solo activo fuera de producción para no saturar logs
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use("/api/tasks",      tasksRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/users",      usersRouter);

// Endpoint de salud: útil para verificar que el servidor responde (Docker healthcheck, CI, etc.)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Manejador de rutas no encontradas (404) ──────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ─── Manejador global de errores ─────────────────────────────────────────────
// Express detecta este middleware por tener 4 parámetros (err, req, res, next)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

// ─── Inicio del servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Backend corriendo en http://localhost:${PORT}`);
});
