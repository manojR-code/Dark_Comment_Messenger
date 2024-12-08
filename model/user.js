const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/datinguser")
const user=mongoose.Schema({
    name: String,
    email:String,
    password: String,
    profile:String
})
module.exports = mongoose.model('user', user);