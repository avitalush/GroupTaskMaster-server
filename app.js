const express = require("express");
const cors = require("cors")

const app = express();
const usersRoutes = require("./routes/users.routes");
const projectsRoutes = require("./routes/projects.routes");
const tasksRoutes = require("./routes/tasks.routes");

app.use(express.json());
app.use(cors());
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/projects", projectsRoutes);
app.use("/api/v1/tasks", tasksRoutes);
app.use((err, req, res, next) => {
    console.log("error: ", err);
    res.status(400).json({
        status: "fail",
        message: err.message
    });
});


module.exports.app = app;