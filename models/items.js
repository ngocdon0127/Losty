// load the things we need
var mongoose = require('mongoose');

var ObjectId     = mongoose.Schema.Types.ObjectId;

// define the schema for our item model
var itemSchema = mongoose.Schema({

    image_link       : {
        type         : String,
        required     : true,
    },

    image_link_small : {
    	 	type         : String,
    	 	required     : true
    },

    title            : {
        type         : String,
        required     : true,
    },

    description      : {
        type         : String,
        required     : true,
    },

    category_id      : {
        type         : ObjectId,
        ref          : 'categores'
    },

    category         : {
        type         : String
    },

    date_lost        : {
        type         : String
    },

    time_post        : {
        type         : String
    },

    type             : {
        type         : Number
    },

    location         : {
        lat          : Number,
        lng          : Number,
        address      : String
    },

    reward           : {
        type         : String
    },

    zipcode          : {
        type         : String
    },

    views            : {
        type         : ObjectId,
        ref          : 'users'
    },

    report           : {
        type         : Number
    }, 

    user             : {
        id           : String,
        avatar       : String,
        username     : String,
        city         : String,
        country      : String
    },

    people_view      : [{
        id           : {
            type         : ObjectId,
            ref          : 'users'
        },
        avatar       : {
            type         : String
        },
        username     : {
            type         : String,
        },
        avatar_small : {
            type         : String
        }
    }]
});


// create the model for items and expose it to our app
module.exports = mongoose.model('Items', itemSchema);
