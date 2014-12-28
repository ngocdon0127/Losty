var 	fs 												=	require('fs');
var 	User                      = require('./../../models/users');

var   domain             			  = require('./../../config/default').domain_default;

var 	validate_token            = require('./../../app/validate/validate_token');

var   async                     = require('async');

var   bcrypt             				= require('bcrypt-nodejs');
var   make_token                = require('./../../app/authen/make_token');

var 	remove_file          			= require('./../../app/file/remove');
var   resize             			  = require('./../../app/file/resize');



module.exports								=	function(req, res){

	try{
		var data = req.body;

		//data :  {"user": { "token" : "...",  "user_id" : ".." },  "image_link" : "/tmp/..",  "extension" : "jpeg",
    //         "email" : "...", "username":"...", "password":"a123456",

    var user_id    = data.user.user_id;
    var token      = data.user.token;
    var image_link = data.image_link;
    var extension  = data.extension;
    var email      = data.email;
    var username   = data.username;
    var password   = data.password;

    var img_server = '';

	}

	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	}

	finally{
		validate_token(user_id, token, function(valid){
			if (!valid){
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});
				res.status(200).end();
			} else{

				async.waterfall([	

					function(next){	
						if (image_link != '' && fs.existsSync(image_link)){
							// Update avatar

							var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime()  + '.' + extension;
				      var new_location = '/img/avatar/';
				      // SAVE IMAGE
				      fs.rename(image_link, './public' + new_location + file_name, function(err) {
				      	if (err) {
				          res.json({error_code : 306, msg : err.toString()});       // Image is not exist
				          res.status(200).end();
				          return 1;
				        } else{
				        	img_server = domain + new_location + file_name;
				        	next(null);
				        }
				      });
						} else{
							console.log('next thoi');
							next(null);
						}
					}, 

					function(next){
						User.findOne({_id : user_id}, function(err, user_exist){
							if (err || !user_exist){
								res.json({error_code : 201, msg : 'User is not exist'});
								res.status(200).end();
							} else{
								async.waterfall([
									function(next2){
										user_exist.username = username;
										if (email != user_exist.email){
											User.findOne({email : email}, function(err, user_exist2){
												if (user_exist2){
													console.log('Email is really exist');
													res.json({error_code : 200, msg : 'Email is really exist'});
													res.status(200).end();
													return 1;
												} else{
													console.log(user_exist2);
													user_exist.email  = email;
													next2(null);
												}												
											})
										} else{
											next2(null);
										}
									},
									function(next2){

										if (img_server != ''){
											user_exist.avatar = img_server;
											resize(user_exist.avatar, function(avatar_small){
												user_exist.avatar_small = avatar_small;
												next2(null);
											});			
										} else{
											next2(null);
										}
									}
								], function(err){
		              if (password != '')
		              	user_exist.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

		              process.nextTick(function(){
		              	user_exist.save(function(err){console.log('User infor saved')});

		              	res.json({error_code : 0 , user : {
		                            email : user_exist.email, username : user_exist.username, 
		                            id    : user_exist._id  , avatar   : user_exist.avatar,
		                            avatar_small : user_exist.avatar_small
		                        } });
		              	res.status(200).end();
		              });
								});
							}
						})
						}
					], function(err){
					});
			}
		})
	}
}