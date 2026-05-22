const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/tasksController");

// IMPORTANTE: la ruta /stats debe declararse ANTES de /:id
// Si estuviera después, Express interpretaría "stats" como un id UUID y fallaría.
router.get("/stats", ctrl.getTaskStats);

// Rutas CRUD estándar
router.get   ("/",    ctrl.getAllTasks);   // Listar (con filtros)
router.get   ("/:id", ctrl.getTaskById);  // Obtener una
router.post  ("/",    ctrl.createTask);   // Crear
router.patch ("/:id", ctrl.updateTask);   // Actualizar (parcial)
router.delete("/:id", ctrl.deleteTask);   // Eliminar

module.exports = router;
