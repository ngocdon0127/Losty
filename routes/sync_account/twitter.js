var async								=	require('async');

var Users                 =   require('./../../models/users');

var consumer_key 				=	require('./../../app/authen/auth').consumer_key;
var consumer_secret			=	require('./../../app/authen/auth').consumer_secret;

var make_token					=	require('./../../app/authen/make_token');
var add_friend_twitter 	= require('./../../app/add_friend/add_friend_twitter');
var check_exist_account   =   require('./../../app/check_exist_account');


var validate_token      = require('./../../app/validate/validate_token');

var User   							=	require('./../../models/users');

var util 								= require('util'),
	twitter 							= require('twitter');


var twit;
var user_id, token;
var profile, friends;
var access_token_key, access_token_secret ;

module.exports  	=	function(req, res){
	try{
		var data  = req.body;
		user_id   = data.user.user_id;
		token     = data.user.token;
		access_token_key    = data.access_token_key;
		access_token_secret = data.access_token_secret;
	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});						//	Input is invalid
		res.status(200).end();
	}
	finally{
		validate_token(user_id, token, function(valid){
			if (!valid){
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});
				res.status(200).end();
			} else{
				check_exist_account(3, user_id, function(check_exist){
					if (!check_exist){
						async.waterfall([

							function(next){

								twit = new twitter({
									consumer_key: consumer_key,
								 	consumer_secret: consumer_secret,
								  access_token_key: access_token_key,
								  access_token_secret: access_token_secret
								});

							  process.nextTick(function(){
							   	next(null);
							  })
							},

							function(next){
								twit.get('/friends/list.json', {include_entities:true}, function(data) {
								    friends = data.users;
								    next(null);
								});
							},

							function(next){
								twit.get('/account/verify_credentials.json' , {include_entities:true}, function(data) {
								    profile = data;
				  				  next(null);
								});
							}],

							function(err){
								if (!friends || !profile){
									res.json({error_code : 101, msg : 'Access_token is incorrect'});			// Access_token is incorrect
									res.status(200).end();
								} else{
									// LOGIN OR REGISTER
									User.findOne({'twitter.id' : profile.id}, function(err, user_exist){
										if (err){
											res.json({error_code : 401, msg : err.toString()});		//	Database cannot find
											res.status(200).end();
										} else{
											if (user_exist){

												res.json({error_code : 201, msg : 'Sync not successful due to existing account'});
												res.status(200).end();
											} else{
												// MAKE NEW ACCOUNT
												User.findOne({_id : user_id}, function(err, me){
													if (err || !me){
														res.json({error_code : 401, msg : 'Not found user'});
														res.status(200).end();
													} else{
														me.twitter.id = profile.id;
							    					me.exist_acc[3]     = 1;

														me.twitter.token_key = access_token_key;
														me.twitter.token_secret = access_token_secret;

														me.save(function(err){
															if (err){
																res.json({error_code : 402, msg : err.toString()});		//	Database cannot save
																res.status(200).end();
															} else{
																process.nextTick(function(){
																	add_friend_twitter(me._id, friends);
																	
									    					  res.json({error_code : 0, fb_id : me.facebook.id, tw_id : me.twitter.id});
																	res.status(200).end();
																});
															}
														});
													}
												})
											}
										}
									})
								}
						});			
					} else{
						Users.findOne({_id : user_id}, function(err, user_exist){
		  				if (user_exist){

			  				user_exist.twitter.id 			    = '';
			  				user_exist.twitter.token_key    = '';
			  				user_exist.twitter.token_secret = '';
			  				user_exist.save(function(err){
									res.json({error_code : 0, fb_id : user_exist.facebook.id, tw_id : user_exist.twitter.id});
			  					res.status(200).end();
			  				});
		  				} else{
			  					res.json({error_code : 0, msg : 'Account is not exist'});
			  					res.status(200).end();
		  				}
		  			})
					}
				});
			}
		});
	}
}