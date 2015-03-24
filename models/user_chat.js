// load the things we need
var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;

// define the schema for our item model
var user_chatSchema = mongoose.Schema({
	user_chat: [{
		type: ObjectId,
		ref: "users"
	}]
});


// create the model for items and expose it to our app
module.exports = mongoose.model('User_chat', user_chatSchema);