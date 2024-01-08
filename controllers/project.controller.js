const { Project } = require("../models/project.model")
const { Task } = require("../models/task.model")
// const { User } = require("../models/user.model")
const Joi = require("joi")
const mongoose = require("mongoose");
const SMTPConnection = require("nodemailer/lib/smtp-connection");


const today = new Date();
const someDay = new Date("2024-1-1")
console.log();



// const ProjectJoiSchema = {
//     createProject: Joi.object().keys({
//         name: Joi.string().required(),
//         description: Joi.string(),
//         date_created: Joi.date(),
//         category: Joi.string().required(),
//         price: Joi.number().required(),
//     })
// }

exports.creatingProgressGraph = async (req, res, next) => {
    try {
        const id = req.params.id;
        const project = await Project.findOne({ id });
     
        let tasks = await Task.find({});
       let tasksResult = tasks.filter((task) => { return task.project == id; })



        let creates = 0, dones = 0, progresses = 0, errors = 0, all = 0,todo=0, value;
    const objectsArray = [];

    // Find the project creation date
    const projectStartDate = new Date(Math.min(...tasksResult.map(task => task.date_created.getTime())));
    // Find the project end date (current date)
    const projectEndDate = new Date();
    // Calculate the number of days between project start and end
    const daysDiff = Math.floor((projectEndDate - projectStartDate) / (1000 * 60 * 60 * 24));
    // Initialize the matrix with zeros


    const matrix = Array.from({ length: daysDiff + 1 }, () => Array(tasksResult.length).fill(0));
    tasksResult.forEach((task, index) => {
        const createdCurrentTask = Math.floor((task.date_created - projectStartDate) / (1000 * 60 * 60 * 24));
        const progressCurrentTask = task.date_inProgress ? Math.floor((task.date_inProgress - projectStartDate) / (1000 * 60 * 60 * 24)) : -1;
        const errorCurrentTask = task.date_error ? Math.floor((task.date_error - projectStartDate) / (1000 * 60 * 60 * 24)) : -1; 
        const doneCurrentTask = task.date_done ? Math.floor((task.date_done - projectStartDate) / (1000 * 60 * 60 * 24)) : -1;
        matrix[createdCurrentTask][index] = 1;
        if(progressCurrentTask!==-1){
                    matrix[progressCurrentTask][index] = 2;

        }
        if(errorCurrentTask!==-1){
                    matrix[errorCurrentTask][index] = 3;

        }
        if(doneCurrentTask!==-1){
            console.log(doneCurrentTask,index,task.title);
                    matrix[doneCurrentTask][index] = 4;
                    console.log("aaaaa");

        }
        ///console.log(task.title,createdCurrentTask,progressCurrentTask,errorCurrentTask,doneCurrentTask,matrix);
        if (createdCurrentTask === progressCurrentTask&&progressCurrentTask!==-1) {
            matrix[createdCurrentTask][index] = 5;
            if (createdCurrentTask === errorCurrentTask&&progressCurrentTask!==-1) {
                matrix[createdCurrentTask][index] = 6;
            }
            if (createdCurrentTask === doneCurrentTask&&progressCurrentTask!==-1) {
                matrix[createdCurrentTask][index] = 7;
            }
        }
         else {
       /*      if (progressCurrentTask === errorCurrentTask) {
                matrix[progressCurrentTask][index] = 8;
            } */
            if (progressCurrentTask === doneCurrentTask && progressCurrentTask!==-1) {
                console.log(progressCurrentTask,doneCurrentTask,task.title);
                matrix[progressCurrentTask][index] = 9;
            }
        } 

        if ((errorCurrentTask === progressCurrentTask || doneCurrentTask === progressCurrentTask)&& progressCurrentTask!==-1)
           matrix[progressCurrentTask][index] = 8;
        if (errorCurrentTask === doneCurrentTask && doneCurrentTask!==-1){
                        matrix[doneCurrentTask][index] = 9;

        }

    });
console.log(matrix);
    for (let i = 0; i <= daysDiff; i++) {
        for (let j = 0; j < tasksResult.length; j++) {
            value = matrix[i][j]
            switch (value) {
                case 1:
                    all++;
                    creates++;
                    todo++;
                    break;
                case 2:
                    todo--;
                    progresses++;
                    break;
                case 3:
                    progresses--;
                    //כאשר לא באותו היום הועבר
/*                     errors++
 */                    break;
                case 4:
                    progresses--;
                    dones++;
                    break;
                case 5:
                    all++;
                    progresses++;
                    break;
                case 6:
                    all++;
                    errors++;
                    break;
                case 7:
                    all++;
                    dones++;
                    break;
           /*      case 8:
                    errors++
                    break; */
                case 9:
                    dones++;
                    break;
                default:
                    // פעולות ברירת מחדל
                    break;
            }

      
        }
        objectsArray.push({
            date: new Date(projectStartDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            all,
            creates,
            progresses,
            errors:all- todo-progresses-dones,
            dones
        });
        creates=0;
    }
        res.status(200).json({
            status: 'success',
            objectsArray: objectsArray
        });
    } catch (error) {
        next(error);
    }
}

exports.addUser = async (req, res, next) => {
    console.log("success from addUser");
    const projectId = req.query.projectId;
    const userId = req.query.userId;

    try {
        const project = await Project.findOne({ id: projectId });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can add users to the project' });
        }
        if (project.admin == userId) { // 2 and not 3 equals cheks if the value is the same even if the types are not the same
            return res.status(400).json({ error: 'Admin cannot be a user' });
        }
        if (project.users.includes(userId)) {
            return res.status(400).json({ error: 'User already exists in the project' });
        }
        project.users.push(userId);
        await project.save();

        res.status(201).send(project);
    } catch (error) {
        next(error);
    }
}
exports.addUsers = async (req, res, next) => {
    console.log("success from addUsers");
    const projectId = req.query.projectId;
    const usersId = req.query.userId.split(',');
    console.log(usersId);
    try {
        const project = await Project.findOne({ id: projectId });
        if (!project)
            return res.status(400).json({ error: 'project do not exist' });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can add users to the project' });
        }
        if (usersId.includes(project.admin)) { // 2 and not 3 equals cheks if the value is the same even if the types are not the same
            return res.status(400).json({ error: 'Admin cannot be a user' });
        }

        usersId.map(async (user) => {
            if (project.users.includes(user)) {
                return res.status(400).json({ error: `User ${user} already exists in the project` });
            }
            project.users.push(user);
            await project.save();
        })

        res.status(201).send(project);
    } catch (error) {
        next(error);
    }
}

exports.removeUser = async (req, res, next) => {
    console.log("success from removeUser");
    const projectId = req.query.projectId;
    const userId = req.query.userId;

    try {
        const project = await Project.findOne({ id: projectId });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can remove users from the project' });
        }
        const userIndex = project.users.indexOf(userId);
        project.users.splice(userIndex, 1);
        await project.save();

        res.status(201).send(project);
    } catch (error) {
        next(error);
    }
}
exports.addTask = async (req, res, next) => {
    console.log("success from addTask");
    const projectId = req.query.projectId;
    const taskId = req.query.taskId;

    try {
        const project = await Project.findOne({ id: projectId });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can add tasks to the project' });
        }
        if (project.users.includes(userId)) {
            return res.status(400).json({ error: 'User already exists in the project' });
        }
        project.users.push(userId);
        await project.save();

        res.status(201).send(project);
    } catch (error) {
        next(error);
    }
}

exports.removeTask = async (req, res, next) => {
    console.log("success from removeUser");
    const projectId = req.query.projectId;
    const userId = req.query.userId;

    try {
        const project = await Project.findOne({ id: projectId });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can remove users from the project' });
        }
        const userIndex = project.users.indexOf(userId);
        project.users.splice(userIndex, 1);
        await project.save();

        res.status(201).send(project);
    } catch (error) {
        next(error);
    }
}

exports.editTask = async (req, res, next) => {
    console.log("success from removeUser");
    const projectId = req.query.projectId;
    const userId = req.query.userId;

    try {
        const project = await Project.findOne({ id: projectId });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can remove users from the project' });
        }
        const userIndex = project.users.indexOf(userId);
        project.users.splice(userIndex, 1);
        await project.save();

        res.status(201).send(project);
    } catch (error) {
        next(error);
    }
}

// exports.search = async (req, res, next) => {
//     console.log("success from search");
//     const page = req.query.page;
//     const s = req.query.s;
//     const perPage = 2;
//     const skip = (page - 1) * perPage;


//     try {
//         const Projects = await Project.find({ $or: [{ name: s }, { info: s }] })
//             .skip(skip).limit(perPage);
//         res.send(Projects)
//     } catch (error) {
//         next(error);
//     }
// }

// exports.getProjectByCategory = async (req, res, next) => {
//     console.log("success from getProjectByCategory");
//     const cat = req.params.catname;
//     console.log(cat);
//     try {
//         const Projects = await Project.find({ "category": cat });
//         res.send(Projects);
//     } catch (error) {
//         next(error);
//     }
// }

exports.createProject = async (req, res, next) => {
    console.log("success from createProject");
    const body = req.body;
    try {
        // const validate = ProjectJoiSchema.createProject.validate(body);
        // console.log("validate: ", validate);
        // if (validate.error) {
        //     next(Error(validate.error));
        // }
        const newProject = new Project(body);
        newProject.id = newProject._id;
        // newProject.id_user=res.locals.userId;
        newProject.admin = res.locals.userId;

        await newProject.save();
        return res.status(201).json({ status: "success", project: newProject })
    } catch (error) {
        next(error)
    }
}

exports.editProject = async (req, res, next) => {
    console.log("success from editProject");
    const id = req.params.id;
    console.log(id);
    const body = req.body
    try {
        const project = await Project.findOne({ id });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can edit the project' });
        }
        await Project.updateOne({ id }, body);
        res.status(201).json({ status: "success" })
    } catch (error) {
        next(error);
    }
}

exports.deleteProject = async (req, res, next) => {
    console.log("success from deleteProject");


    try {
        const id = req.params.id;
        const project = await Project.findOne({ id });
        if (project.admin != res.locals.userId) {
            return res.status(400).json({ error: 'Only admin can delete a project' });
        }
        await Project.deleteOne({ id });
        res.status(200).json({ status: "success" })
    } catch (error) {
        next(error);
    };
}

exports.findProjectByIdReturnTasks = async (req, res, next) => {
    console.log("success from findProjectByIdReturnTasks");
    const id = req.params.id;
    try {
        let tasks = await Task.find({});
        tasks = tasks.filter((task) => { console.log(task.project == id); return task.project == id; })
        console.log(tasks);
        res.status(200).json({
            status: 'success',
            tasks
        });
    } catch (error) {
        next(error);
    }
}

exports.findProjectByIdReturnUsers = async (req, res, next) => {
    console.log("success from findProjectByIdReturnUsers");
    const id = req.params.id;
    try {
        const project = await Project.findById(id).populate('users');
        console.log(project.users);
        res.status(200).json({
            status: 'success',
            users: project.users
        });
    } catch (error) {
        next(error);
    }
}

exports.graph = async (req, res, next) => {
    console.log("success from graph");
    const projectId = req.query.projectId;
    try {
        const tasks = await Task.find({ project: new mongoose.Types.ObjectId(projectId) })
        const task_len = tasks.length;
        tasks[10] = 90;
        console.log(tasks, task_len);
        calculateGraph(tasks);
        res.status(200).json({
            status: 'success'
        });
    } catch (error) {
        next(error);
    }
}

const calculateGraph = (tasks) => {
    const today = new Date();
    const daysForProject = Math.floor((today - tasks[0].date_created) / (1000 * 3600 * 24));
    let numberOfTasks = 0;
    let inProgress = 0;
    let done = 0;
    let error = 0;
    tasks.map((task) => {
        switch (task.status) {
            
            case "inProgress":
                ++inProgress;
                break;
            case "done":
                ++done;
                break;
            case "error":
                ++error;
                break;
        
            default:
                break;
        }
    })
}