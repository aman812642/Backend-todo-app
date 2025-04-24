const mongoose = require('mongoose')

const todoSchema = mongoose.Schema({
    todotitle : String,
    todocontent : String,
    date : {
        type : Date,
        default : Date.now
    },

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user'
    }
})

module.exports = mongoose.model('todo' , todoSchema)