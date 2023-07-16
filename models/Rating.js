const mongoose = require('mongoose')

const rating = new mongoose.Schema({
    productId: {
        type: String,
    },
    productName: {
        type: String,
    },
    listReview:[
       {
            userReview:{
                type: String,
            },
            reviewPost:{
                type: String,
            },
            rating:{
                type: Number,
            },
            date: {
                type: String,
            },
       }
    ],
})

module.exports = mongoose.model('Rating', rating)
