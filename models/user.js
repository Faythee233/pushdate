const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    firstname: String,
    middlename:String,
    lastname:String,
    username:String,
    email: String,
    password: String,
    is_online: { type: Boolean, default: false },
    profile_img_id: { type: String, default: ''},
    profile_img_url: {type: String, default: ''},
    bio: String, //Short description

    interests: {
        type: String,
        enum: [ 'Tech', 'Music', 'Sports']
    }
}, { timestamps: true, collection: 'users'});


const model = mongoose.model('User', userSchema)
module.exports= model

