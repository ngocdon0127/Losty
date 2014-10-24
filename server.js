// ==================================================SETUP TOOL NEED===================================
var express         =   require('express');
var app             =   express();
var ip              =   'localhost';
var port            =   process.env.PORT || 8080;
var mongoose        =   require('mongoose');
var Router_raw      =   express.Router();
var Router_formdata =   express.Router();

var routes   		= require('./routes');

var db_url   		= require('./config/default').database;

// ==================================================CONFIGURATION===================================

mongoose.connect(db_url); // connect to our database

require('./config/index.js')(app, Router_raw, Router_formdata);  //  all config

// ================================================= API ============================================

// REGISTER, LOGIN, LOGOUT =================
Router_raw.post('/login', 		  		routes.login.local);          	// api login with local account
Router_raw.post('/register', 			routes.register.local);       	// api register with local account
Router_raw.post('/logout', 		  		routes.logout);					// api logout 

// UPLOAD PHOTO
Router_formdata.post('/upload_photo',	routes.upload_photo);			// api upload photo, return link '/tmp'

// UPLOAD PHOTO_ITEM
Router_raw.post('/set_photo',   		routes.photo.set);				// api set photo
Router_raw.post('/del_photo',			routes.photo.del);				// api del photo

// CREATE, UPDATE, VIEW, REMOVE ITEMS
Router_raw.post('/set_an_item', 		routes.item.set);        		// api create, update an item
Router_raw.get('/get_an_item/:id',	 	routes.item.get);				// api get an  item
Router_raw.post('/del_an_item', 		routes.item.del);				// api del an  item

// SEARCH ITEM BY KEYWORD
Router_raw.post('/search_item', 		routes.item.search);			// api search item

// CREATE, UPDATE, VIEW, REMOVE CATEGORES
Router_raw.post('/set_a_category', 		routes.category.set);			// api create,update categores   (ONLY ADMIN)
Router_raw.get('/get_categores',  		routes.category.get);			// api get categores

// REQUEST RECENT
Router_raw.post('/recent',				routes.recent);					// api request recent

// =================================================== LISTEN BY IP AND PORT ========================

var io = require('socket.io').listen(app.listen(port, ip, function(){
    console.log('Server is running at http://%s:%s', ip, port);
}));
