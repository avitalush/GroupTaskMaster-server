const mongoose = require("mongoose");

const msgSchema = new mongoose.Schema({
/*     id: {
        type: String,
        required: true
    }, */
    content:{
        type: String,
        required: true   
    },
/*     room: {
        type: mongoose.Types.ObjectId,
        ref: 'Room',
        required: true,
    }, */
    room: {
        type: String,
        required: true,
    },
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    }
});

const msg = mongoose.model("msg", msgSchema);
module.exports.Msg = msg;
