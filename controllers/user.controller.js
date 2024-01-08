const bcrypt = require("bcryptjs")
const { User } = require("../models/User.model")
const { Project } = require("../models/project.model")
const { Task } = require("../models/task.model")
const Joi = require("joi")
const { generateToken } = require("../utils/jwt")
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const crypto = require('crypto');


const resetTokens = {};



const UserJoiSchema = {
    login: Joi.object().keys({
        password: Joi.string(),
        email: Joi.string().email({ tlds: { allow: ['com'] } }).error(() => Error('Email is not valid'))
    }),
    register: Joi.object().keys({
        password: Joi.string().max(20).required(),
        email: Joi.string().email({ tlds: { allow: ['com'] } }).error(() => Error('Email is not valid')),
        name: Joi.string().required(),
        pic: Joi.string(), 
    })
}





exports.register = async (req, res, next) => {
    console.log("success from register");
    const body = req.body;
    try {
        const validate = UserJoiSchema.register.validate(body);
        console.log("validate: ", validate);
        if (validate.error) {
            return next(new Error("Error validate"));
        }
        if (await checkIfUserExists(body.email)) {
            return next(new Error("user alrady exist"));
        }
        const newUser = new User(body);
        newUser.id = newUser._id;
        const hash = await bcrypt.hash(body.password, 10);
        newUser.password = hash;
        await newUser.save();

        console.log(newUser);

        const transporter = nodemailer.createTransport({
            service: 'outlook', // Use the email service provider, e.g., Gmail
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASSWORD // Your email password (or an app-specific password)
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: body.email,
            subject: 'Wellcome to TaskMaster',
            text: `hi ${body.name} 
            thank you for joining TaskMaster`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

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

exports.loginAsAdmin = async (req, res, next) => {
    console.log("success from loginAsAdmin");
    const password = req.body;
    log
    try {
        // const validate = UserJoiSchema.login.validate(body);
        // if (validate.error) {
        //     return next(Error(validate.error));
        // }

        //check is User exists
        const admin = await User.findOne({ password });
        // if exsits check if password match
        if (!admin) {
            return next(Error('Password is not correct'));
        }
        //* generate jwt token
        const token = generateToken(admin);
        const users = await User.find();

        return res.status(201).json({ users, token });
        // send the User object to the client
    } catch (error) {
        next(error);
    }
};

exports.forgetPassword = async (req, res, next) => {
    console.log("success from forgetPassword");
    const email = req.body.email;
    console.log(email);
    try {

        const user = await checkIfUserExists(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        resetTokens[resetToken] = user.id;


        const transporter = nodemailer.createTransport({
            service: 'outlook', // Use the email service provider, e.g., Gmail
            auth: {
                user: process.env.EMAIL_USER, // Your email address
                pass: process.env.EMAIL_PASSWORD // Your email password (or an app-specific password)
            }
        });


        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `Click on the following link to reset your password: http://localhost:5173/resetpassword/${resetToken}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        // Close the transporter
        transporter.close();

        return res.status(201).send({ status: "success", msg: "send email" });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    console.log("success from resetPassword");

    const { token } = req.params;
    const newPassword = req.body.newPassword;
    const userId = resetTokens[token];

    if (!userId) {
        return res.status(400).json({ status: "fail", message: 'Invalid or expired token' });
    }

    try {
        const user = await User.findById(userId);
        const hash = await bcrypt.hash(newPassword, 10);

        user.password = hash;
        await user.save();


    } catch (error) {
        next(error);
    }

    delete resetTokens[token];

    res.json({ status: "success", message: 'Password reset successful' });
}

exports.getProjectsFromUser = async (req, res, next) => {

    const userId = req.query.userId;

    try {
        const projects = await Project.find();
        const allProjectsFromUser = projects.filter((project) => project.users.includes(new mongoose.Types.ObjectId(userId)) || project.admin == userId);
        return res.status(201).json({ status: "success", projects: allProjectsFromUser });

    } catch (error) {
        next(error);
    }
}

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
        const users = await User.find();
        res.status(200).json({
            status: "success",
            users
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    console.log("success from getUserById");
    let userId = req.query.userId;
    console.log(userId);
    try {
        const user = await User.find({ id: userId });
        res.status(200).json({
            status: "success",
            user
        });
    } catch (error) {
        next(error);
    }
};

exports.getAllTasks = async (req, res, next) => {
    console.log("success from getAllTasks");
    let userId = req.query.userId;
    try {
        const tasks = await Task.find({ user: new mongoose.Types.ObjectId(userId) })
        res.status(200).json({
            status: "success",
            tasks
        });
    } catch (error) {
        next(error);
    }
}


 


async function checkIfUserExists(email) {
    const user = await User.findOne({ email });
    return user;
}