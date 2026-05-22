/**
 * routes/categories.js — Endpoints HTTP para el recurso Categoría
 *
 * Montado bajo /api/categories en server.js.
 * Soporta CRUD completo: listar, crear, actualizar y eliminar.
 */

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/categoriesController");

router.get   ("/",    ctrl.getAllCategories); // GET    /api/categories
router.post  ("/",    ctrl.createCategory);  // POST   /api/categories
router.patch ("/:id", ctrl.updateCategory);  // PATCH  /api/categories/:id
router.delete("/:id", ctrl.deleteCategory);  // DELETE /api/categories/:id

module.exports = router;
