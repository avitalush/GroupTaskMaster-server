const express = require("express");
const { register, login, editUser, deleteUser, getAllUsers, getUserById, getProjectsFromUser, forgetPassword, resetPassword, getAllTasks, loginAsAdmin } = require("../controllers/user.controller");
const router = express.Router();



router.post("/register", register);
router.post("/login", login);
router.post("/loginAsAdmin", loginAsAdmin);
router.patch("/editUser/:id", editUser);
router.delete("/deleteUser/:id", deleteUser);
router.get("/getUserById", getUserById);
router.get("/getAllUsers", getAllUsers);
router.get("/getProjectsFromUser", getProjectsFromUser);
router.get("/getAllTasks", getAllTasks);
router.post("/forgetPassword", forgetPassword);
router.post("/resetPassword/:token", resetPassword);


module.exports = router; 