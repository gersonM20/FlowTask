const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/categoriesController");

router.get ("/", ctrl.getAllCategories); // Listar todas
router.post("/", ctrl.createCategory);  // Crear nueva

module.exports = router;
