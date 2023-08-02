const mongoose = require('mongoose')

const product = new mongoose.Schema({
    name: {
        type: String,
    },
    number: {
        type: Number
    },
    price:{
        type: Number,
    },
    date: {
        type: String,
    },
    category: {
        type: String,
    },
    desc: {
        type: String,
    },
    detail: {
        type: String,
    },
    image: {
        path:String,
        name:String,
        imageType:String
    },
    totalSold:{
        type:Number
    }
})

module.exports = mongoose.model('Product', product)
