const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    date_created: {
        type: Date,
        required: true,
        default: new Date()
    },
    pic: {
        type: String,
        require: false
    }

});

const User = mongoose.model("User", userSchema);
module.exports.User = User;