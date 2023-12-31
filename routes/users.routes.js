const express = require("express");
const { register, login, editUser, deleteUser, getAllUsers, getUserById, getProjectsFromUser } = require("../controllers/user.controller");
const router = express.Router();



router.post("/register", register);
router.post("/login", login);
router.patch("/editUser/:id", editUser);
router.delete("/deleteUser/:id", deleteUser);
router.get("/getUserById", getUserById);
router.get("/getAllUsers", getAllUsers);
router.get("/getProjectsFromUser", getProjectsFromUser);


module.exports = router;