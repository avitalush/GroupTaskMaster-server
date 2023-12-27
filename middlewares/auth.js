const { decodeToken } = require("../utils/jwt");

exports.auth = () => {
    return async function (req, res, next) {
        let token = req.headers["authorization"];
        if (!token) return res.sendStatus(401);
        token = token.split(" ")[1];
        console.log(token);
        try {
            const payload = decodeToken(token);
            console.log(payload);
            // if (role && payload._doc.role !== role) return res.sendStatus(401);
            res.locals.userId = payload._doc.id;
            next();
        } catch (error) {
            next(error);
        }
    }
}