require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()

if(process.env.MONGODB_URI)
{
    mongoose.connect(process.env.MONGODB_URI,{
        useNewUrlParser: true,
    })
    console.log(`Connect db success to production`)
}
else
{
    mongoose.connect("mongodb://127.0.0.1:27017/ShopCart?readPreference=primary&directConnection=true&ssl=false",{
        useNewUrlParser: true,
    })
    console.log(`Connect db success to development`)
}