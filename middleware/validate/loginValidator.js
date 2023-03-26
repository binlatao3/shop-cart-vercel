const { check } = require('express-validator');
const User = require('../../models/User')
const loginValidator = [
    check('username').exists().withMessage('Please enter your valid username')
    .notEmpty().withMessage("Please enter your username"),

    check('password').exists().withMessage('Please enter your valid password')
    .notEmpty().withMessage('Please enter your password'),
]

module.exports = loginValidator