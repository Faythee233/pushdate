const express = require('express')
const app = express()

const mongoose = require('mongoose')
const multer = require('multer')
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//connect to database
mongoose.connect(process.env.mongo_uri)
const con = mongoose.connection
con.on('open', () => {
    console.log('Connected to database')
})
con.on('error', (error) => {
    console.log(`Error connecting to database: ${error}`)
})

     //routes
    app.use('/auth', require('./routes/auth'))
    app.use('/profile', require('./routes/profile'))

    app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})