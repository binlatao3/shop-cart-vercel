const {check}  = require('express-validator')
const path = require('path')

module.exports = [
    check('name')
    .exists().withMessage('Please enter valid product name')
    .notEmpty().withMessage('Please enter product name'),

    check('number')
    .exists().withMessage('Please enter number')
    .notEmpty().withMessage('Please enter valid number')
    .isInt({ min:0}).withMessage('Please enter number'),

    check('price')
    .exists().withMessage('Please enter price')
    .notEmpty().withMessage('Please enter price')
    .isInt({ min:0}).withMessage('Please ener valid price'),

    check('dom').exists().withMessage('Please enter valid date of manufacture')
    .notEmpty().withMessage('Please enter date'),

    check('type').exists().withMessage('Please enter valid type')
    .notEmpty().withMessage('Please enter type')
    .isIn(['Laptop', 'Smartphone', 'Camera']).withMessage('Invalid type'),
]