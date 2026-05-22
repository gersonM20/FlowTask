const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/usersController");

router.get("/",    ctrl.getAllUsers);   // Listar todos
router.get("/:id", ctrl.getUserById);  // Obtener uno por ID

module.exports = router;
