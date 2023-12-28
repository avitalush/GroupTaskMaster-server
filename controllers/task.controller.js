const { Task } = require("../models/task.model")
const { Project } = require("../models/project.model")
const Joi = require("joi")
const mongoose = require("mongoose");


// const TaskJoiSchema = {
//     createTask: Joi.object().keys({
//         name: Joi.string().required(),
//         info: Joi.string(),
//         category: Joi.string().required(),
//         price: Joi.number().required(),
//     })
// }

exports.createTask = async (req, res, next) => {
    console.log("success from createTask");
    const body = req.body;
    const projectId = req.query.projectId;
    try {
        // const validate = TaskJoiSchema.createTask.validate(body);
        // console.log("validate: ", validate);
        // if (validate.error) {
        //     next(Error(validate.error));
        // }
        const project = await Project.findOne({ id: projectId });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can add tasks to the project' });
        }

        const newTask = new Task(body);
        newTask.project = projectId;
        newTask.id = newTask._id;

        await newTask.save();
        return res.status(201).json({ status: "success" })
    } catch (error) {
        next(error)
    }
}

exports.createTasks = async (req, res, next) => {
    console.log("success from createTasks");
    const body = req.body;
    const projectId = req.query.projectId;
    console.log("body:", body);
    try {
        // const validate = TaskJoiSchema.createTask.validate(body);
        // console.log("validate: ", validate);
        // if (validate.error) {
        //     next(Error(validate.error));
        // }
        const project = await Project.findOne({ id: projectId });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can add tasks to the project' });
        }
        body.map(async (task) => {
            const newTask = new Task(task);
            newTask.project = projectId;
            newTask.id = newTask._id;
            await newTask.save();
        })

        return res.status(201).json({ status: "success" })
    } catch (error) {
        next(error)
    }
}

exports.editTask = async (req, res, next) => {
    console.log("success from editTask");
    const taskId = req.params.id;
    const body = req.body
    try {
        const task = await Task.findOne({ id: taskId });
        const project = await Project.findOne({ id: task.project });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can edit tasks in the project' });
        }
        await Task.updateOne({ id: taskId }, body);
        res.status(201).send("update Task");
    } catch (error) {
        next(error);
    }
}

exports.deleteTask = async (req, res, next) => {
    console.log("success from deleteTask");
    const taskId = req.params.id;

    try {
        const task = await Task.findOne({ id: taskId });
        const project = await Project.findOne({ id: task.project });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can delete tasks from the project' });
        }
        await Task.deleteOne({ id: taskId });
        res.status(200).send("deleted");
    } catch (error) {
        next(error);
    };
}
exports.addUserToTask = async (req, res, next) => {
    console.log("success from addUserToTask");
    const taskId = req.params.id;
    let userId = req.query.userId;
    if (!userId) {
        userId = res.locals.userId;
    }
    try {
        let task = await Task.findOne({ id: taskId });
        const project = await Project.findOne({ id: task.project });
        const temp = new mongoose.Types.ObjectId(userId);
        const userIndex = project.users.indexOf(temp);
        if (project.admin != res.locals.userId) {
            if (!project.permissiontoAssociateTasks) {
                return res.status(400).json({ error: 'Only admin can add users to this project' });
            }
            if (userIndex === -1) {
                return res.status(400).json({ error: 'user do not exist in the project' });
            }
            task = await Task.findOneAndUpdate({ id: taskId }, { user: res.locals.userId }, { new: true });
        }
        else {
            if (userIndex === -1 && project.admin != userId) {
                return res.status(400).json({ error: 'user do not exist in the project' });
            }
            task = await Task.findOneAndUpdate({ id: taskId }, { user: userId }, { new: true });
        }
        res.status(200).send(task);
    } catch (error) {
        next(error);
    };
}


exports.findTaskById = async (req, res, next) => {
    console.log("success from findTaskById");
    const id = req.params.id;
    console.log(id);
    try {
        const Task = await Task.findOne({ "id": id });
        res.send(Task);
    } catch (error) {
        next(error);
    }
}