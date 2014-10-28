var async					=	require('async');

var consumer_key 			=	require('./../../app/auth').consumer_key;
var consumer_secret			=	require('./../../app/auth').consumer_secret;

var make_token				=	require('./../../app/make_token');
var add_friend_twitter      =   require('./../../app/add_friend_twitter');


var util 					= require('util'),
	twitter 				= require('twitter');


var twit;
var profile, friends;
var access_token_key, access_token_secret ;


var User   					=	require('./../../models/users');


module.exports  	=	function(req, res){
	if (!req.rawBody){
		res.json({err : 'request is incorrect'});
		res.status(200).end();
	} else{
		async.waterfall([
			function(next){
				var data  = JSON.parse(req.rawBody);

				access_token_key    = data.access_token_key;
				access_token_secret = data.access_token_secret;

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
				console.log('FRIEND :' , friends);
				console.log('PROFILE :'  ,profile);

				// LOGIN OR REGISTER
				User.findOne({'twitter.id' : profile.id}, function(err, user_exist){
					console.log('User is exist : ', user_exist);
					if (err){
						console.log(err);
						res.json({err : 'Request is incorrect'});
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
							console.log('screen_name : ', typeof(profile));
							user.username = profile.screen_name;

							// IMAGE NORMAL
							user.avatar   = profile.profile_image_url;

							user.twitter.id = profile.id;

							user.twitter.token_key = access_token_key;
							user.twitter.token_secret = access_token_secret;

							user.save(function(err){
								if (err){
									console.log('Hava error : ', err);
								} else{
									process.nextTick(function(){
										make_token(user, res);
										add_friend_twitter(user._id, FRIENDiends);
									});
								}

							});
						}
					}
				})
			});	
	}
}