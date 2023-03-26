const mongoose = require('mongoose')

const bill = new mongoose.Schema({
    username:{
        type:String,
    },
    address:{
        type:String,
    },
    city:{
        type:String,
    },
    emailReceive:{
        type:String,
    },
    dateCreate:{
        type:String,
    },
    telephone:{
        type:String,
    },
    notes:{
        type:String,
    },
    methodPay:{
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
    ],
    totalNumber:{
        type:Number,
    },
    totalPrice:{
        type:Number,
    }
})

module.exports = mongoose.model('Bill', bill)
