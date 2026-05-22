const { Pool } = require("pg");

// Pool de conexiones a PostgreSQL.
// Un Pool reutiliza conexiones abiertas en lugar de abrir una nueva por cada query,
// lo que mejora el rendimiento en aplicaciones con múltiples peticiones simultáneas.
const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME     || "taskmanager",
  user:     process.env.DB_USER     || "taskuser",
  password: process.env.DB_PASSWORD || "taskpass123",
});

// Escucha errores inesperados en clientes del pool (ej. caída de la DB mientras la app corre)
pool.on("error", (err) => {
  console.error("Error inesperado en el cliente de PostgreSQL:", err.message);
});

// Verificación de conectividad al arrancar el servidor
pool.query("SELECT 1").then(() => {
  console.log("✅  Conectado a PostgreSQL");
}).catch((err) => {
  console.error("❌  No se pudo conectar a PostgreSQL:", err.message);
});

module.exports = pool;
