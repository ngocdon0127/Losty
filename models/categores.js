// load the things we need
var mongoose = require('mongoose');

var ObjectId     = mongoose.Schema.Types.ObjectId;

// define the schema for our item model
var categorySchema = mongoose.Schema({
    name            : {
        type        : String
    }

});


// create the model for items and expose it to our app
module.exports = mongoose.model('Categores', categorySchema);
