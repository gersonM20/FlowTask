/**
 * routes/users.js — Endpoints HTTP para el recurso Usuario
 *
 * Montado bajo /api/users en server.js.
 *
 * Para extender con edición y eliminación de usuarios:
 *  1. Agregar updateUser y deleteUser en usersController.js
 *  2. Registrar aquí:
 *     router.patch ("/:id", ctrl.updateUser);
 *     router.delete("/:id", ctrl.deleteUser);
 */

const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/usersController");

router.get ("/"   , ctrl.getAllUsers);   // GET  /api/users
router.get ("/:id", ctrl.getUserById);  // GET  /api/users/:id
router.post("/"   , ctrl.createUser);   // POST /api/users

module.exports = router;
