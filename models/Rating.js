const mongoose = require('mongoose')

const rating = new mongoose.Schema({
    idProduct: {
        type: String,
    },
    nameProduct: {
        type: String,
    },
    date: {
        type: String,
    },
    review:{
        type: String,
    },
    userReview:{
        type: String,
    },
    rating:{
        type: Number,
    }
})

module.exports = mongoose.model('Rating', rating)
