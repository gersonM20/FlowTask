/**
 * routes/tasks.js — Endpoints HTTP para el recurso Tarea
 *
 * Todas las rutas se montan bajo /api/tasks en server.js.
 *
 * IMPORTANTE: /stats debe declararse ANTES de /:id.
 * Si estuviera después, Express trataría la cadena "stats" como un UUID
 * y pasaría el control a getTaskById, que fallaría silenciosamente.
 *
 * Para agregar un nuevo endpoint de tareas:
 *  1. Crear la función en controllers/tasksController.js
 *  2. Importarla en el destructuring de ctrl
 *  3. Registrar la ruta aquí con el método HTTP correcto
 */

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/tasksController");

// Endpoint de estadísticas — debe ir antes de /:id (ver nota arriba)
router.get("/stats", ctrl.getTaskStats);

// CRUD estándar
router.get   ("/",    ctrl.getAllTasks);   // GET    /api/tasks
router.get   ("/:id", ctrl.getTaskById);  // GET    /api/tasks/:id
router.post  ("/",    ctrl.createTask);   // POST   /api/tasks
router.patch ("/:id", ctrl.updateTask);   // PATCH  /api/tasks/:id  (actualización parcial)
router.delete("/:id", ctrl.deleteTask);   // DELETE /api/tasks/:id

module.exports = router;
