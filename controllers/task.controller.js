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

exports.addNote = async (req, res, next) => {
    console.log("success from addNote");
    const note = req.body.note;
    const taskId = req.query.taskId;
    console.log("body:", note);
    try {
        const task = await Task.findOne({ id: taskId });
        const project = await Project.findOne({ id: new mongoose.Types.ObjectId(task.project) });
        console.log(project);
        if (project.admin == res.locals.userId) {
            task.notes.push({ note, own: "admin" })
            await task.save();
        }
        else if (task.user == res.locals.userId) {
            task.notes.push({ note, own: "user" })
            await task.save();
        }
        else {
            return res.status(400).json({ status: "fail", msg: "Only admin or associated usercan add a note to the task" })
        }
        return res.status(201).json({ status: "success" })
    } catch (error) {
        next(error)
    }
}
exports.editNote = async (req, res, next) => {
    console.log("success from editNote");
    const note = req.body.note;
    const taskId = req.query.taskId;
    const index = req.query.index;
    try {
        const task = await Task.findOne({ id: taskId });
        const project = await Project.findOne({ id: new mongoose.Types.ObjectId(task.project) });
        if (project.admin == res.locals.userId) {
            if (task.notes[index].own === 'admin')
                task.notes[index] = { note: note, own: "admin" }
            else
                return res.status(400).json({ status: "fail", msg: "Only user can edit this note" })
            await task.save();
        }
        else if (task.user == res.locals.userId) {
            if (task.notes[index].own === 'user')
                task.notes[index] = { note: note, own: "user" }
            else
                return res.status(400).json({ status: "fail", msg: "Only admin can edit this note" })
            await task.save();
        }
        else {
            return res.status(400).json({ status: "fail", msg: "Only admin or associated user can edit this note" })
        }
        return res.status(201).json({ status: "success" })
    } catch (error) {
        next(error)
    }
}
exports.deleteNote = async (req, res, next) => {
    console.log("success from deleteNote");
    const taskId = req.query.taskId;
    const index = req.query.index;
    try {
        const task = await Task.findOne({ id: taskId });
        const project = await Project.findOne({ id: new mongoose.Types.ObjectId(task.project) });
        if (project.admin == res.locals.userId) {
            if (task.notes[index].own === 'admin')
                task.notes.splice(index, 1);
            else
                return res.status(400).json({ status: "fail", msg: "Only user can delete this note" })
            await task.save();
        }
        else if (task.user == res.locals.userId) {
            if (task.notes[index].own === 'admin')
                task.notes.splice(index, 1);
            else
                return res.status(400).json({ status: "fail", msg: "Only admin can delete this note" })
            await task.save();
        }
        else {
            return res.status(400).json({ status: "fail", msg: "Only admin or associated user can delete this note" })
        }
        return res.status(201).json({ status: "success" })
    } catch (error) {
        next(error)
    }
}

exports.changeStatus = async (req, res, next) => {
    console.log("success from changeStatus");
    const taskId = req.query.taskId;
    const status = req.query.status;
    try {
        const task = await Task.findOne({ id: taskId });
        const project = await Project.findOne({ id: new mongoose.Types.ObjectId(task.project) });
        console.log(project.admin, task.user, res.locals.userId);
        if (project.admin != res.locals.userId && task.user != res.locals.userId) {
            return res.status(400).json({ status: "fail", msg: "Only admin or associated user can change status" })
        }
        task.status = status
        switch(status){
            case "error":{
                task.date_error=new Date();
                break;
            }
            case "done":{
                task.date_done=new Date();
                break;
            }
            case "inProgress":{
                task.date_inProgress=new Date();
                break;
            }
default:
    break;
        }
        await task.save();
        return res.status(201).json({ status: "success" })
    } catch (error) {
        next(error)
    }
}