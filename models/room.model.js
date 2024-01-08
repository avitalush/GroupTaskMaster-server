const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    users: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    project: {
        type: mongoose.Types.ObjectId,
        ref: 'Project',
        required: true,
    }
});

const room = mongoose.model("room", roomSchema);
module.exports.Room = room;
