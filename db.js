require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()

app.set('env', 'development')

switch(app.get('env')){
    case 'development':
        mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser: true,
        })
        console.log(`Connect db success - ${app.get('env')}`)
        break
}
