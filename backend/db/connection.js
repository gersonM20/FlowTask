const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME     || "taskmanager",
  user:     process.env.DB_USER     || "taskuser",
  password: process.env.DB_PASSWORD || "taskpass123",
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL client error:", err.message);
});

// Verify connectivity at startup
pool.query("SELECT 1").then(() => {
  console.log("✅  Connected to PostgreSQL");
}).catch((err) => {
  console.error("❌  Could not connect to PostgreSQL:", err.message);
});

module.exports = pool;
