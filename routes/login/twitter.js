var async = require('async');

var consumer_key = require('./../../app/authen/auth').consumer_key;
var consumer_secret = require('./../../app/authen/auth').consumer_secret;

// var add_friend_twitter 	= require('./../../app/add_friend/add_friend_twitter');

var User = require('./../../models/users');

var util = require('util'),
	twitter = require('twitter');

var twit;
var profile, friends;
var access_token_key, access_token_secret;

module.exports = function(req, res) {
	try {

		if (process.argv[2] === 'dev') {
			var consumer_key = require('./../../config/Oauth_development').twitterAuth.consumerKey;
			var consumer_secret = require('./../../config/Oauth_development').twitterAuth.consumerSecret
		} else {
			var consumer_key = require('./../../config/Oauth').twitterAuth.consumerKey;
			var consumer_secret = require('./../../config/Oauth').twitterAuth.consumerSecret
		}

		var data = req.body;
		access_token_key = data.access_token_key;
		access_token_secret = data.access_token_secret;
	} catch (err) {
		res.write(JSON.stringify({
			error_code: 1,
			msg: err.toString()
		}));
		res.status(200).end();
	} finally {
		async.waterfall([
				function(next) {

					twit = new twitter({

						consumer_key: consumer_key,
						consumer_secret: consumer_secret,
						access_token_key: access_token_key,
						access_token_secret: access_token_secret

					});
					next(null);
				},
				// function(next){
				// 	twit.get('/friends/list.json', {include_entities:true}, function(data) {
				// 	    friends = data.users;
				// 	    next(null);
				// 	});
				// },

				function(next) {

					twit.get('/account/verify_credentials.json', {
						include_entities: true
					}, function(data) {
						profile = data;
						next(null);

					});
				}
			],
			function(err) {
				if (!friends || !profile) {
					res.write(JSON.stringify({
						error_code: 1,
						msg: 'Access_token is incorrect'
					})); // Access_token is incorrect
					res.status(200).end();
				} else {
					// LOGIN OR REGISTER
					User.findOne({
						'twitter_infor.id': profile.id
					}, function(err, user_exist) {
						if (err) {
							res.write(JSON.stringify({
								error_code: 1,
								msg: err.toString()
							}));
							res.status(200).end();
						} else {
							if (user_exist) {

								// LOGIN WITH TWITTER ACCOUNT

								user_exist.twitter_infor.access_token = access_token_key;
								user_exist.twitter_infor.token_secret = access_token_secret;

								user_exist.makeToken();
								user_exist.save(function(err) {});
								res.write(JSON.stringify({
									error_code: 0,
									user: user_exist
								}));
								res.status(200).end();
							} else {
								// MAKE NEW ACCOUNT

								var newUser = new User();
								newUser.newInforTw(access_token_key, access_token_secret, profile, function(user) {
									res.write(JSON.stringify({
										error_code: 0,
										user: user
									}));
									res.status(200).end();
								})

							}
						}
					})
				}
			});
	}
}