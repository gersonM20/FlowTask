const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/tasksController");

// Stats endpoint must come before /:id to avoid being captured as an id
router.get   ("/stats", ctrl.getTaskStats);

router.get   ("/",     ctrl.getAllTasks);
router.get   ("/:id",  ctrl.getTaskById);
router.post  ("/",     ctrl.createTask);
router.patch ("/:id",  ctrl.updateTask);
router.delete("/:id",  ctrl.deleteTask);

module.exports = router;
