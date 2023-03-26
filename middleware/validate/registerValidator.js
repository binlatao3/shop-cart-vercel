const { check } = require('express-validator');
const User = require('../../models/User')
const registervalidator = [
    check('fullname').exists().withMessage('Please enter your valid name')
    .notEmpty().withMessage("Please enter your name"),

    check('username').exists().withMessage('Please enter your valid username')
    .notEmpty().withMessage("Please enter your username")
    .custom((value, { req }) => {
        return User.findOne({username: value}).then(user => {
            if (user) {
                return Promise.reject('username already in use');
            }
            else
            {
                return true
            }
        });
    }),

    check('email').exists().withMessage('Please enter your email')
    .notEmpty().withMessage('Please enter your email')
    .isEmail().withMessage('Please enter a valid email')
    .custom((value, { req }) => {
        return User.findOne({email: value}).then(user => {
            if (user) {
                return Promise.reject('Email already in use');
            }
            else
            {
                return true
            }
        });
    }),

    check('password').exists().withMessage('Please enter your valid password')
    .notEmpty().withMessage('Please enter your password')
    .isLength({min: 6}).withMessage('Passwords must be at least 6 characters'),

    check('passwordConfirm').exists().withMessage('Please enter your valid confirm password')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value,{ req }) =>{
        let body = req.body
        if (value != body.password) {
            return Promise.reject('Password confirmation does not match');
        }
        else
        {
            return true
        }
    }),
]

module.exports = registervalidator