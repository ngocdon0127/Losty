// load the things we need
var mongoose = require('mongoose');

var ObjectId     = mongoose.Schema.Types.ObjectId;

// define the schema for our photo model
var photoSchema = mongoose.Schema({

    name            : {
        type        : String
    },

    image_link_small: {
        type        : String
    },

    image_link      : {
    	type        : String
    },

    image_link_normal : {
        type        : String
    },

    user_id         : {
    	type        : ObjectId,
    	ref         : 'users'
    }

});


// create the model for photos and expose it to our app
module.exports = mongoose.model('Photos', photoSchema);
