var async								=	require('async');

var consumer_key 				=	require('./../../app/authen/auth').consumer_key;
var consumer_secret			=	require('./../../app/authen/auth').consumer_secret;

var make_token					=	require('./../../app/authen/make_token');
var add_friend_twitter 	= require('./../../app/add_friend/add_friend_twitter');

var User   							=	require('./../../models/users');

var util 								= require('util'),
	twitter 							= require('twitter');


var twit;
var profile, friends;
var access_token_key, access_token_secret ;

module.exports  	=	function(req, res){
	try{
		var data  = req.body;
		access_token_key    = data.access_token_key;
		access_token_secret = data.access_token_secret;
	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});						//	Input is invalid
		res.status(200).end();
	}
	finally{
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

								// LOGIN WITH TWITTER ACCOUNT

								user_exist.twitter.token_key = access_token_key;
								user_exist.twitter.token_secret = access_token_secret;

								make_token(user_exist, res);
							} else{
								// MAKE NEW ACCOUNT

								var user = new User;
								user.username = profile.screen_name;
								user.type_account = 3;

								// IMAGE NORMAL
								user.avatar   = profile.profile_image_url;

								user.twitter.id = profile.id;

								user.twitter.token_key = access_token_key;
								user.twitter.token_secret = access_token_secret;

								user.save(function(err){
									if (err){
										res.json({error_code : 402, msg : err.toString()});		//	Database cannot save
										res.status(200).end();
									} else{
										process.nextTick(function(){
											make_token(user, res);
											add_friend_twitter(user._id, friends);
										});
									}

								});
							}
						}
					})
				}
			});	
	}
}