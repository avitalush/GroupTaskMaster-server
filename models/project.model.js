const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
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
    users: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }],
    admin: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    permissiontoAssociateTasks: {
        type: Boolean,
        required: true,
        default: true
    },
    color: {
        type: String,
        required: true,
        default: "red"

    }
});

const project = mongoose.model("project", projectSchema);
module.exports.Project = project;