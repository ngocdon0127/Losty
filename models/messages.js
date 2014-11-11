// load the things we need
var mongoose = require('mongoose');

var ObjectId     = mongoose.Schema.Types.ObjectId;

// define the schema for our message model
var messageSchema = mongoose.Schema({

    user_send        : {
        type         : ObjectId,
        ref          : 'users'
    },

    user_recei       : {
        type         : ObjectId,
        ref          : 'users'
    },

    content          : {
        type         : String,
        required     : true,
    },

    time             : {
        type         : String
    },

    status           : {
        type         : Number
    }
});


// create the model for message and expose it to our app
module.exports = mongoose.model('Messages', messageSchema);
