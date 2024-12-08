const mongoose = require('mongoose');
const msg=mongoose.Schema({
    rec: mongoose.Schema.Types.ObjectId,
    send: mongoose.Schema.Types.ObjectId,
    recs: [{
            type: String
    }],
    sends: [{
        type: String
    }],
    reacted:Boolean,
})
module.exports = mongoose.model('msg', msg);