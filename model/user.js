const mongoose = require('mongoose')
const MONGODB_URI = "mongodb://127.0.0.1:27017/miniproject"
mongoose.connect(process.env.MONGODB_URI);

const userSchema = mongoose.Schema({
    username : String,
    name : String,
    age : Number,
    email : String,
    password : String,
    todos : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'todo'
        }
    ]
})

module.exports = mongoose.model('user' , userSchema);
