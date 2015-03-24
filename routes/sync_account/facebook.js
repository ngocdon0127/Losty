var Users = require('./../../models/users');

var client_id = require('./../../app/authen/auth').client_id_fb;
var client_secret = require('./../../app/authen/auth').client_secret_fb;

// var client_id          =   '1495985440641529';
// var client_secret      =   '0ef9188327f12b29bbe76bf5a274cfe7';

var async = require('async');
var graph = require('fbgraph');

var make_token = require('./../../app/authen/make_token');
var add_friend_fb = require('./../../app/add_friend/add_friend_fb');
var check_exist_account = require('./../../app/check_exist_account');

var validate_token = require('./../../app/validate/validate_token');

var User = require('./../../models/users');

var options = {
	timeout: 3000,
	pool: {
		maxSockets: Infinity
	},
	headers: {
		connection: "keep-alive"
	}
};


function API(api, callback) {
	graph
		.setOptions(options)
		.get(api, function(err, data) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, data);
			}
		});
}

module.exports = function(req, res) {
	var access_token = '';
	var user_id, token;

	var profile = {},
		friends = {},
		avatar = {};

	try {
		var data = req.body;
		user_id = data.user.user_id;
		token = data.user.token;
		access_token = data.access_token;
	} catch (err) {
		res.json({
			error_code: 201,
			msg: err.toString()
		});
		res.status(200).end();
	} finally {
		validate_token(user_id, token, function(valid) {
			if (valid) {
				check_exist_account(2, user_id, function(check_exist) {
					if (!check_exist) {
						async.series([

							function(next) {
								graph.setAccessToken(access_token);

								graph.extendAccessToken({
									"access_token": access_token,
									"client_id": client_id,
									"client_secret": client_secret
								}, function(err, facebookRes) {
									if (err) {
										res.json({
											error_code: 101,
											msg: err.message
										}); //	Access_token is incorrect
										res.json({
											error_code: 101,
											msg: 'Error validating access token: The session is invalid because the user logged out or access token is incorrect'
										}); //	Access_token is incorrect
										res.status(200).end();
									} else {
										next(null);
									}
								});
							},

							function(next) { // GET PROFILE
								API("/me", function(err, data) {
									if (err) {
										console.log(err);
										res.json({
											error_code: 600,
											msg: err.message
										}); //	Have error
										res.status(200).end();
									} else {
										profile = data;
										next(null);
									}
								});
							},

							function(next) {
								API("/me/friends", function(err, data) { // GET FRIENDS
									if (err) {
										console.log(err);
										res.json({
											error_code: 600,
											msg: err.message
										}); //	Have error
										res.status(200).end();
									} else {
										friends = data.data;
										next(null);
									}
								});
							},

							function(next) {
								API("me?fields=picture.width(800).height(800)&redirect=false", function(err, data) {
									if (err) {
										console.log(err);
										res.json({
											error_code: 600,
											msg: err.message
										}); //	Have error
										res.status(200).end();
									} else {
										avatar = data.picture.data.url; // GET AVATAR
										next(null);
									}
								});

							}
						], function(err) {

							User.findOne({
								'facebook.id': profile.id
							}, function(err, user_exist) {
								if (err) { // database cannot find
									res.json({
										error_code: 401,
										msg: err.toString()
									});
									res.status(200).end();
								} else {
									if (user_exist) { // USER IS REALLY EXIST
										res.json({
											error_code: 201,
											msg: 'Sync not successful due to existing account'
										});
										res.status(200).end();
									} else { // UPDATE USER
										User.findOne({
											_id: user_id
										}, function(err, me) {
											if (err) {
												res.json({
													error_code: 401,
													msg: err.toString()
												});
												res.status(200).end();
											} else {
												me.exist_acc[2] = 1;
												me.facebook.email = profile.email;
												me.facebook.id = profile.id;
												me.facebook.token = access_token;
												3
												me.save(function(err) {
													if (err) {
														res.json({
															error_code: 402,
															msg: err.toString()
														}); //	database cannot save
														res.status(200).end();
													} else {
														process.nextTick(function() {
															// Add friends
															add_friend_fb(me._id, friends);

															res.json({
																error_code: 0,
																fb_id: me.facebook.id,
																tw_id: me.twitter.id
															});
															res.status(200).end();
														})
													}
												})
											}
										});
									}
								}
							});
						});
					} else {
						Users.findOne({
							_id: user_id
						}, function(err, user_exist) {
							if (user_exist) {
								user_exist.facebook.id = '';
								user_exist.facebook.token = '';
								user_exist.facebook.email = '';
								user_exist.save(function(err) {
									res.json({
										error_code: 0,
										msg: 'Unsync success'
									});
									res.status(200).end();
								});
							} else {
								res.json({
									error_code: 0,
									msg: 'Account is not exist'
								});
								res.status(200).end();
							}
						})
					}
				})

			} else {
				res.json({
					error_code: 100,
					msg: 'Authenticate is incorrect'
				});
				res.status(200).end();
			}
		})
	}
};