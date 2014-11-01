// load the things we need
var mongoose = require('mongoose');
var ObjectId     = mongoose.Schema.Types.ObjectId;
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    avatar           : {
        type         : String,
        default      : 'http://localhost:8080/img/avatar/default-avatar.png'
    },

    username         : {
        type         : String,
        required     : true
    },

    email            : {
        type         : String,
        default      : ''
    },

    permission       : {
        type         : Number,
        default      : 0
    },

    city             : String,
    country          : String,

    local            : {
        password     : {
            type     : String,
            default  : ''
        }
    },
    
    facebook         : {
        id           : {
            type     : String,
            default  : ''
        },
        token        : {
            type     : String,
            default  : ''
        }
    },

    twitter          : {
        id           : {
            type     : String,
            default  : ''
        },
        token_key        : {
            type     : String,
            default  : ''
        },
        token_secret        : {
            type     : String,
            default  : ''
        }
    },

    location         : {
        lat          : Number,
        lng          : Number
    },

    Item             : [{
        type         : ObjectId,
        ref          : 'items',
        default      : []
    }],

    Photo             : [{
        type         : ObjectId,
        ref          : 'photos',
        default      : []
    }],


    Message          : [{
        type         : ObjectId,
        ref          : 'messages',
        default      : []
    }],

    // Notification     : [{
    //     type         : ObjectId,
    //     ref          : 'notifications',
    //     default      : []
    // }],

    Friend           : [{   

        id           :{
            type         : ObjectId,
            ref          : 'user'
        },

        avatar       : String,
        username     : String,

        default      : []
    }],
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    if (this.local.password =='') return 0;         // facebook/twitter account not have password
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Users', userSchema);
