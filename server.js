// =====================================SETUP TOOL NEED===================================
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

// ============================CONFIGURATION===================================

mongoose.connect(db_url); // connect to our database

require('./config/index.js')(app, Router_raw, Router_formdata, Router_body);

// ============================ API ============================================

app.get('/api/privacy_policy',					 function(req, res){
	res.render('privacy_policy');
})

app.get('/api/terms_and_conditions',		 function(req, res){
	res.render('terms_and_conditions');
})

app.get('/api/contact_us',		 						 function(req, res){
	res.render('contact_us');
})

app.get('/api/about_us',		 						 function(req, res){
	res.render('about_us');
})


app.get('/api/login_fb',								 function(req, res){
	res.render('login_fb');
})

app.get('/api/login_twitter',						 function(req, res){
	res.render('login_twitter');
})

app.get('/api/reset_password/:resetKey',		 function(req, res){
	res.render('reset_password', {reset_key : req.params.resetKey});
})

// REGISTER, LOGIN, LOGOUT LOCAL 
Router_body.post('/login', 		  			 	 					routes.login.local);         
Router_body.post('/register', 					 					routes.register.local);      
Router_body.post('/logout', 		  		   					routes.logout);					

// REGISTER, LOGIN, LOGOUT FACEBOOK
Router_body.post('/login_fb',         	 					routes.login.facebook); 

// REGISTER, LOGIN, LOGOUT TWITTER
Router_body.post('/login_twitter',		   					routes.login.twitter);	

// UPLOAD PHOTO
Router_formdata.post('/upload_photo',	   					routes.upload_photo);		

// UPLOAD PHOTO_ITEM
Router_formdata.post('/set_multi_photo',					routes.photo.set_multi);
Router_body.post('/set_photo',   			 	 					routes.photo.set);			
Router_body.post('/del_photo',					 					routes.photo.del);			
Router_body.get('/get_photo/:photo_id',  					routes.photo.get);			
Router_body.post('/get_photos',				   					routes.photo.getAll);		

// CREATE, UPDATE, VIEW, REMOVE ITEMS
Router_body.post('/del_item', 			   				  	routes.item.del);       
Router_body.post('/list_item', 			   				  	routes.item.list);       
Router_body.post('/set_an_item', 			   					routes.item.set);      
Router_body.post('/edit_item', 			   						routes.item.edit);      
Router_body.get('/get_an_item/:item_id', 					routes.item.get);			
Router_body.post('/add_people_view',     					routes.item.add_people_view);	

// SEARCH ITEM BY KEYWORD
Router_body.post('/search_item', 		     					routes.item.search);		

// FIND ITEM BY CATEGORY, TITLE, LOCATION AND DATE
Router_body.post('/find_item', 		     			   		routes.item.find);			

// CREATE, UPDATE, VIEW, REMOVE CATEGORES
Router_body.post('/set_a_category', 		 					routes.category.set);			
Router_body.get('/get_categores',  		   					routes.category.get);		

// REQUEST RECENT
Router_body.post('/recent',				 	     					routes.recent);				
// GET FRIENDS
Router_body.post('/get_friends',			   					routes.friend.get);		

// GET MESSAGE
Router_body.post('/get_messages',		     					routes.message.get);			
Router_body.post('/get_inbox',   		     					routes.message.get_inbox);
Router_body.post('/del_inbox',										routes.message.del_inbox);


// SYNC ACCOUNT
Router_body.post('/sync_fb',						 					routes.sync_account.facebook);
Router_body.post('/sync_tw',						 					routes.sync_account.twitter);

// MAKE FRIEND
Router_body.post('/make_friend',				 					routes.friend.make);			

// EDIT PROFILE
Router_body.post('/edit_profile',				 					routes.edit_profile);	

// FORGOT PASSWORD
Router_body.post('/forgot_password', 		 					routes.forgot_password.forgot_password);
Router_body.post('/reset_password',								routes.forgot_password.reset_password);

// DEACTIVE ACCOUNT
Router_body.post('/deactive_account',							routes.deactive_account);

// ERROR CODE
Router_body.get('/error_code/:error_code',				routes.error_code);

// =================================== LISTEN BY IP AND PORT ========================


var server  = app.listen(port, function(){
    console.log('Server started at port : ' + port);
})

var io = require('socket.io').listen(server);

require('./app/chat/handler_socket')(io);
