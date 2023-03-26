const mongoose = require('mongoose')

const userCart = new mongoose.Schema({
    username:{
        type:String,
    },
    carts:[
        {
            productName:{
                type:String,
            },
            productNumber:{
                type:Number,
            },
            productPrice:{
                type:Number,
            },
            productImage:{
                path:String,
                name:String,
                imageType:String
            }
        }
    ]
})

module.exports = mongoose.model('UserCart', userCart)
