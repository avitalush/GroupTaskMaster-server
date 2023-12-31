const express = require("express");
const { createTask, editTask, deleteTask, findTaskById, addUserToTask, createTasks, addNote, editNote, deleteNote } = require("../controllers/task.controller");
const router = express.Router();
const { auth } = require("../middlewares/auth");



router.post("/createTask", auth(), createTask);
router.post("/createTasks", auth(), createTasks);
router.patch("/editTask/:id", auth(), editTask);
router.delete("/deleteTask/:id", auth(), deleteTask);
router.patch("/addUserToTask/:id", auth(), addUserToTask);
router.get("/findTaskById/:id", findTaskById);
router.post("/addNote", auth(), addNote);
router.patch("/editNote", auth(), editNote);
router.delete("/deleteNote", auth(), deleteNote);


module.exports = router;