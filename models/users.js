// load the things we need
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    avatar: {
        type: String,
        default: 'http://104.131.69.233:3000/img/full_size/avatar/default-avatar.png'
    },

    avatar_small: {
        type: String,
        default: 'http://104.131.69.233:3000/img/full_size/avatar/default-avatar.png'
    },

    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        default: ''
    },

    permission: {
        type: Number,
        default: 0
    },

    city: {
        type: String
    },

    country: {
        type: String
    },

    location: {
        lat: String,
        lng: String
    },

    type_account: {
        type: Number,
        default: 1
    },

    local: {
        password: {
            type: String,
            default: ''
        }
    },

    facebook: {
        id: {
            type: String,
            default: ''
        },
        token: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        }
    },

    twitter: {
        id: {
            type: String,
            default: ''
        },
        token_key: {
            type: String,
            default: ''
        },
        token_secret: {
            type: String,
            default: ''
        }
    },

    location: {
        lat: Number,
        lng: Number
    },

    Item: [{
        type: ObjectId,
        ref: 'items'
    }],

    Photo: [{
        type: ObjectId,
        ref: 'photos'
    }],

    unread_msg: {
        type: Number,
        default: 0
    },

    users_chat: [{
        id: {
            type: ObjectId,
            ref: 'user'
        },
        username: String,
        avatar: String,
        avatar_small: String
    }],

    Friend: [{

        id: {
            type: ObjectId,
            ref: 'user'
        },

        avatar: String,
        username: String,
        avatar_small: String
    }],

    exist_acc: [0, 0, 0, 0],

    active: {
        type: Number,
        default: 1
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    if (this.local.password == '') return 0; // facebook/twitter account not have password
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Users', userSchema);