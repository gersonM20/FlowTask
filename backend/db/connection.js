/**
 * db/connection.js — Pool de conexiones a PostgreSQL
 *
 * Exporta un único Pool compartido por toda la aplicación (patrón singleton).
 * Usar un Pool en lugar de clientes individuales permite:
 *  - Reutilizar conexiones abiertas en lugar de abrir una nueva por cada query
 *  - Limitar el número máximo de conexiones concurrentes a la BD
 *  - Gestionar automáticamente la cola de peticiones cuando todas las conexiones están ocupadas
 *
 * Para extender:
 *  - Ajustar `max` (defecto 10) para controlar el número máximo de conexiones
 *  - Agregar `ssl: { rejectUnauthorized: false }` para conexiones a BD en la nube (RDS, Supabase, etc.)
 *  - Agregar `idleTimeoutMillis` para cerrar conexiones inactivas en producción
 */

const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME     || "taskmanager",
  user:     process.env.DB_USER     || "taskuser",
  password: process.env.DB_PASSWORD || "taskpass123",
  // max: 10  ← número máximo de clientes en el pool (valor por defecto)
});

/**
 * Captura errores inesperados en clientes del pool que ya fueron devueltos.
 * Sin este listener, un error de este tipo silencioso podría tirar el proceso.
 */
pool.on("error", (err) => {
  console.error("[DB] Error inesperado en cliente del pool:", err.message);
});

/**
 * Verifica la conectividad al iniciar el servidor.
 * Falla rápido en caso de mala configuración en lugar de fallar
 * en la primera petición real del usuario.
 */
pool.query("SELECT 1")
  .then(() => console.log("✅  Conectado a PostgreSQL"))
  .catch((err) => console.error("❌  No se pudo conectar a PostgreSQL:", err.message));

module.exports = pool;
