/**
 * server.js — Punto de entrada del servidor Express
 *
 * Responsabilidades de este archivo:
 *  1. Cargar variables de entorno (.env)
 *  2. Registrar middleware global (CORS, JSON, logger)
 *  3. Montar los routers de cada recurso bajo /api
 *  4. Definir manejadores de 404 y errores globales
 *  5. Arrancar el servidor HTTP
 *
 * Para agregar un nuevo recurso:
 *  - Crear routes/nuevoRecurso.js y controllers/nuevoRecursoController.js
 *  - Importar el router aquí y montarlo con app.use("/api/nuevo", nuevoRouter)
 */

require("dotenv").config(); // debe ejecutarse antes de cualquier require que use process.env

const express = require("express");
const cors    = require("cors");

// Routers — cada archivo define las rutas de un recurso
const tasksRouter      = require("./routes/tasks");
const categoriesRouter = require("./routes/categories");
const usersRouter      = require("./routes/users");

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware global ────────────────────────────────────────────────────────

/**
 * CORS: permite que el frontend (puerto 5173) llame a la API.
 * En producción reemplazar "*" por la URL exacta del frontend
 * para evitar que otros orígenes accedan a la API.
 */
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Permite leer req.body como JSON en POST / PATCH
app.use(express.json());

/**
 * Logger de peticiones: solo activo fuera de producción.
 * Para producción se recomienda usar una librería como morgan o pino.
 */
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

/**
 * Health check: útil para Docker HEALTHCHECK, CI/CD y monitoreo.
 * No requiere autenticación ni base de datos.
 */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Manejador 404 ────────────────────────────────────────────────────────────

// Se ejecuta cuando ninguna ruta anterior coincide con la petición
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// ─── Manejador global de errores ──────────────────────────────────────────────

/**
 * Express identifica este middleware por tener exactamente 4 parámetros.
 * Todos los errores pasados con next(err) desde los controladores llegan aquí.
 * Centralizar el manejo de errores evita repetir código try/catch en las rutas.
 *
 * Para extender: agregar casos específicos antes del res.status genérico,
 * p.ej. para errores de validación (status 400) o autenticación (status 401).
 */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

// ─── Arranque ────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅  Backend corriendo en http://localhost:${PORT}`);
  console.log(`    Entorno: ${process.env.NODE_ENV || "development"}`);
});
