// load the things we need
var mongoose = require('mongoose');

var ObjectId     = mongoose.Schema.Types.ObjectId;

// define the schema for our item model
var reset_keySchema = mongoose.Schema({

    key       : {
        type         : String,
        required     : true,
    },

    email            : {
        type         : String,
        required     : true,
    }

});


// create the model for items and expose it to our app
module.exports = mongoose.model('Reset_keys', reset_keySchema);
