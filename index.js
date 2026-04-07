const express = require('express')
const app = express()

const mongoose = require('mongoose')
require('dotenv').config()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//connect to database
mongoose.connect(process.env.mongo_uri)
const con = mongoose.connection
con.on('open', error => {
        if (error) {
            console.log(`Error connecting to database: ${error}`)
        } else {
            console.log('Connected to database')
        }
    })

     //routes
    app.use('/auth', require('./routes/auth'))

    app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})