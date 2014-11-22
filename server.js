// ==================================================SETUP TOOL NEED===================================
var express         =   require('express');
var app             =   express();
var ip              =   'localhost';
var port            =   require('./config/default').port;
var mongoose        =   require('mongoose');
var Router_raw      =   express.Router();
var Router_formdata =   express.Router();
var Router_body 		=   express.Router();


var favicon = require('serve-favicon');

var routes   		= require('./routes');

var db_url   		= require('./config/default').database;

// ==================================================CONFIGURATION===================================

mongoose.connect(db_url); // connect to our database

require('./config/index.js')(app, Router_raw, Router_formdata, Router_body);  //  all config

// ================================================= API ============================================

app.get('/api/login_fb',								 function(req, res){
	res.render('login_fb');
})

app.get('/api/login_twitter',						 function(req, res){
	res.render('login_twitter');
})


// REGISTER, LOGIN, LOGOUT LOCAL 
Router_body.post('/login', 		  			 	 routes.login.local);          	// api login with local account
Router_body.post('/register', 					 routes.register.local);       	// api register with local account
Router_body.post('/logout', 		  		   routes.logout);					// api logout 

// REGISTER, LOGIN, LOGOUT FACEBOOK
Router_body.post('/login_fb',         	 routes.login.facebook);         // api login with facebook

// REGISTER, LOGIN, LOGOUT TWITTER
Router_body.post('/login_twitter',		   routes.login.twitter);			// api login with twitter

// UPLOAD PHOTO
Router_formdata.post('/upload_photo',	   routes.upload_photo);			// api upload photo, return link '/tmp'

// UPLOAD PHOTO_ITEM
Router_body.post('/set_photo',   			 	 routes.photo.set);				// api set photo
Router_body.post('/del_photo',					 routes.photo.del);				// api del photo
Router_body.get('/get_photo/:photo_id',  routes.photo.get);				// api get photo
Router_body.post('/get_photos',				   routes.photo.getAll);			// api get all photos

// CREATE, UPDATE, VIEW, REMOVE ITEMS
Router_body.post('/set_an_item', 			   routes.item.set);       	// api create, update an item
Router_body.get('/get_an_item/:item_id', routes.item.get);				// api get an  item
Router_body.post('/del_an_item', 		     routes.item.del);				// api del an  item
Router_body.post('/add_people_view',     routes.item.add_people_view);				// api del an  item

// SEARCH ITEM BY KEYWORD
Router_body.post('/search_item', 		     routes.item.search);			// api search item

// CREATE, UPDATE, VIEW, REMOVE CATEGORES
Router_body.post('/set_a_category', 		 routes.category.set);			// api create,update categores   (ONLY ADMIN)
Router_body.get('/get_categores',  		   routes.category.get);			// api get categores

// REQUEST RECENT
Router_body.post('/recent',				 	     routes.recent);					// api request recent

// GET FRIENDS
Router_body.post('/get_friends',			   routes.friend.get);				// api get friends

// GET MESSAGE
Router_body.post('/get_messages',		     routes.message.get);			// api get messages

// SYNC ACCOUNT
Router_body.post('/sync_fb',						 routes.sync_account.facebook);
Router_body.post('/sync_tw',						 routes.sync_account.twitter);

// MAKE FRIEND
Router_body.post('/make_friend',				 routes.friend.make);			// api make friends


// FORGOT PASSWORD
Router_body.post('/forgot_password', 		 routes.forgot_password);

// ERROR CODE
Router_body.get('/error_code/:error_code',routes.error_code);

// =================================================== LISTEN BY IP AND PORT ========================

var io = require('socket.io').listen(app.listen(port, function(){
    console.log('Server is running at http://%s:%s', ip, port);
    require('./app/chat/handler_socket')(io);
}));
