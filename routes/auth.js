const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

// middleware that checks for a valid JWT token
const userToken = (req, res, next) => {
    const authHeader = req.header('Authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader

    if (!token) return res.status(401).send({ status: 'error', msg: 'Access denied, token missing' })

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.user = payload
        next()
    } catch (err) {
        return res.status(401).send({ status: 'error', msg: 'Invalid token' })
    }
}

// create account
router.post('/register', async (req, res) => {
    const { firstname, middlename, lastname, username, email, password, interests, bio } = req.body

    if (!firstname || !lastname || !username || !email || !password)
        return res.status(400).send({ status: 'error', msg: 'All fields must be filled' })

    // Start try block
    try {
        //Check if user already exists
        const check = await User.findOne({ email })
        if (check) {
            return res.status(200).send({ status: 'ok', msg: 'An account with this email already exists' })
        }

        //Hash password
        const hashedpassword = await bcrypt.hash(password, 10)

        //Create new user
        const user = new User()
        user.firstname = firstname
        user.middlename = middlename
        user.lastname = lastname
        user.username = username
        user.email = email
        user.password = hashedpassword
        user.profile_img_url = ""
        user.profile_img_id = ""
        user.interests = interests
        user.bio = bio

        await user.save()

        return res.status(200).send({ status: "ok", msg: "success" })

    } catch (error) {
        if (error.name == "JsonWebTokenError")
            return res.status(400).send({ status: 'error', msg: 'Invalid token' })

        return res.status(500).send({ status: 'error', msg: 'An error occured.', error })
    }
})


//endpoint to Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password)
        return res.status(400).send({ status: 'error', msg: 'All fields must be filled' })

    try {
        // Fetch user using email
        let user = await User.findOne({ email }).lean()
        if (!user)
            return res.status(400).send({
                status: 'error', msg: 'No account found with the provided email'
            })


        //compare password
        const correct_password = await bcrypt.compare(password, user.password)
        if (!correct_password)
            return res.status(400).send({ status: 'error', msg: 'Password is incorrect' })

        // create token
        const token = jwt.sign({
            _id: user._id,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: '1d' })

        //update user document to online
        user = await User.findOneAndUpdate({ _id: user._id }, { is_online: true }, { returnDocument: 'after' }).lean()

        //send response
        res.status(200).send({ status: 'ok', msg: 'success', user, token })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', msg: 'An error occured' })
    }
})

//endpoint to Logout
router.post('/logout', userToken, async (req, res) => {
    const {token} = req.body
    if (!token)
        return res.status(400).send({ status: 'error', msg: 'Token is required' })

    try {
        const user= await User.findById(req.user._id)
        // Set user offline
        await User.findByIdAndUpdate({ _id: user._id }, { is_online: false })

        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (error) {
        console.log(error)
        if (error == "JsonWebTokenError")
            return res.status(400).send({ status: 'error', msg: 'Invalid token' })

        return res.status(500).send({ status: 'error', msg: 'An error occured' })
    }
})

//endpoint to delete account
router.post('/delete', userToken, async (req, res) => {
       const {token} = req.body
    if (!token)
        return res.status(400).send({ status: 'error', msg: 'Token is required' })

    try {
        //Find the user and delete the account
        const deleted = await User.findByIdAndDelete(req.user._id)

        //Check if the user exists and was deleted
        if (!deleted)
            return res.status(400).send({ status: 'error', msg: 'No user Found' })

        return res.status(200).send({ status: 'ok', msg: 'success' })

    } catch (error) {
        console.log(error)

        if (error == "JsonWebTokenError")
            return res.status(400).send({ status: 'error', msg: 'Invalid token' })

        return res.status(500).send({ status: 'error', msg: 'An error occured' })
    }

})

module.exports = router