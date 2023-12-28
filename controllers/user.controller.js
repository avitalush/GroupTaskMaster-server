const bcrypt = require("bcryptjs")
const { User } = require("../models/User.model")
const { Project } = require("../models/project.model")
const Joi = require("joi")
const { generateToken } = require("../utils/jwt")
const mongoose = require("mongoose");


const UserJoiSchema = {
    login: Joi.object().keys({
        password: Joi.string(),
        email: Joi.string().email({ tlds: { allow: ['com'] } }).error(() => Error('Email is not valid'))
    }),
    register: Joi.object().keys({
        password: Joi.string().max(20).required(),
        email: Joi.string().email({ tlds: { allow: ['com'] } }).error(() => Error('Email is not valid')),
        name: Joi.string().required(),
        //pic: Joi.image(), //לברר איך כותבים
    })
}





exports.register = async (req, res, next) => {
    console.log("success from register");
    const body = req.body;
    try {
        const validate = UserJoiSchema.register.validate(body);
        console.log("validate: ", validate);
        if (validate.error) {
            return next("Error validate");
        }
        if (await checkIfUserExists(body.email)) {
            return next(Error = "user alrady exist");
        }
        const newUser = new User(body);
        newUser.id = newUser._id;
        const hash = await bcrypt.hash(body.password, 10);
        newUser.password = hash;
        await newUser.save();
        return res.status(201).send("user registered")
    } catch (error) {
        next(error)
    }
}



exports.login = async (req, res, next) => {
    console.log("success from login");
    const body = req.body;
    try {
        const validate = UserJoiSchema.login.validate(body);
        if (validate.error) {
            return next(Error(validate.error));
        }

        //check is User exists
        const User = await checkIfUserExists(body.email);
        // if exsits check if password match
        if (!User || ! await bcrypt.compare(body.password, User.password)) {
            return next(Error('Password or email not valid'));
        }
        //* generate jwt token
        const token = generateToken(User);
        const projects = await Project.find();
        const allProjectsFromUser = projects.filter((project) => project.users.includes(new mongoose.Types.ObjectId(User.id)) || project.admin == User.id);
        
        return res.status(201).send({ allProjectsFromUser, token });
        // send the User object to the client
    } catch (error) {
        next(error);
    }
};


exports.editUser = async (req, res, next) => {
    const id = req.params.id;
    const body = req.body
    if (body.password) {
        const hash = await bcrypt.hash(body.password, 10);
        body.password = hash;
    }

    try {
        await User.updateOne({ id }, body);
        res.status(201).send("update User");
    } catch (error) {
        next(error);
    }
};


exports.deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        await User.deleteOne({ id });
        res.status(200).send("deleted");
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    console.log("success from getAllUsers");
    try {
        const id = req.params.id;
        await User.deleteOne({ id });
        res.status(200).send("deleted");
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    console.log("success from getUserById");
    let userId = req.query.userId;
    try {
        const id = req.params.id;
        await User.deleteOne({ id });
        res.status(200).send("deleted");
    } catch (error) {
        next(error);
    }
};







async function checkIfUserExists(email) {
    const user = await User.findOne({ email });
    return user;
}