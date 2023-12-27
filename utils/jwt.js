var jwt = require('jsonwebtoken');

const jwtSecret='1123@@';

/**
 * 
 * @param {object} payload 
 * @returns {string}
 */

exports.generateToken = (payload) => {
    try {
        const token = jwt.sign({ ...payload },jwtSecret , { expiresIn: '2h' });
        return token;
    } catch (error) {
        next(Error(error.message));
    }
}

/**
 * 
 * @param {string} token 
 * @returns {object}
 */

exports.decodeToken = (token) => {
    try {
        const payload = jwt.verify(token,jwtSecret);
        return payload;
    } catch (error) {
        throw(Error(error.message));
    }
}