const express = require("express");
const { createProject, editProject, deleteProject, findProjectById, addUser, removeUser, addTask, removeTask, editTask } = require("../controllers/project.controller");
const router = express.Router();
const { auth } = require("../middlewares/auth");



router.post("/createProject",auth(), createProject);
router.patch("/editProject/:id",auth(), editProject);
router.delete("/deleteProject/:id",auth(), deleteProject);
router.get("/findProjectById/:id", findProjectById);
router.post("/addUser",auth(), addUser);
router.delete("/removeUser",auth(), removeUser);
router.post("/addTask",auth(), addTask);
router.delete("/removeTask",auth(), removeTask);
router.patch("/editTask",auth(), editTask);


module.exports = router;