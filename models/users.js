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
        required     : true,
    },

    email            : {
        type         : String,
        required     : true
    },

    permission       : {
        type         : Number,
        default      : 0
    },

    city             : String,
    country          : String,

    local            : {
        password     : String,
    },
    facebook         : {
        id           : String,
    },
    twitter          : {
        id           : String,
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

    Message          : [{
        type         : ObjectId,
        ref          : 'messages',
        default      : []
    }],

    Notification     : [{
        type         : ObjectId,
        ref          : 'notifications',
        default      : []
    }],

    Friend           : [{   
        type         : ObjectId,
        ref          : 'user',
        default      : []
    }],
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Users', userSchema);
