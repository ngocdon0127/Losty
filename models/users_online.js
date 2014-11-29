// load the things we need
var mongoose = require('mongoose');
var ObjectId     = mongoose.Schema.Types.ObjectId;

// define the schema for our users_online model
var users_onlineSchema = mongoose.Schema({
    id            : {
        type          : ObjectId,
        ref           : 'users'
    }
})

module.exports = mongoose.model('Users_online', users_onlineSchema);
