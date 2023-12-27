const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    date_created: {
        type: Date,
        required: true,
        default: new Date()
    },
    status: {
        type: String,
        enum: {
            values: ["toDo", "inProgress", "done", "error"],
            massage: "status must be toDo or inProgress or done or error"
        },
        default: "toDo",
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    project: {
        type: mongoose.Types.ObjectId,
        ref: 'Project',
        required: true,
    }
});

const task = mongoose.model("task", taskSchema);
module.exports.Task = task;