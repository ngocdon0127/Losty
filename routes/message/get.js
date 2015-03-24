var async = require('async');
var validate_token = require('./../../app/validate/validate_token');

var Message = require('./../../models/messages');
var User = require('./../../models/users');

module.exports = function(req, res) {
	try {
		// data : { "user" : {"user_id" , "token" }, "friend_id", "start", "limit" }
		var data = req.body;
		var user_id = data.user.user_id;
		var token = data.user.token;
		var friend_id = data.friend_id;
		var start = data.start;
		var limit = data.limit;
		var result;
	} catch (err) {
		res.json({
			error_code: 201,
			msg: err.toString()
		}); //	Input is invalid
		res.status(200).end();
	} finally {
		validate_token(user_id, token, function(valid) {
			if (!valid) {
				res.json({
					error_code: 100,
					msg: 'Authenticate is incorrect'
				}); // Authenticate is incorrect
				res.status(200).end();
			} else {
				Message.find({
					$or: [{
						user_send: user_id,
						user_recei: friend_id
					}, {
						user_send: friend_id,
						user_recei: user_id
					}]
				}, function(err, messages) {
					if (err) {
						res.json({
							error_code: 401,
							msg: err.toString()
						}); // Database cannot find
						res.status(200).end();
					} else {
						async.waterfall([

							function(next) {
								result = messages;

								result.sort(function(a, b) {
									return new Date(b.time) - new Date(a.time);
								});

								result = result.slice(start, start + limit);

								process.nextTick(function() {
									next(null);
								})
							},

							function(next) {

								result.sort(function(a, b) {
									return new Date(a.time) - new Date(b.time);
								});

								User.findOne({
									_id: friend_id
								}, function(err, user_exist) {
									if (err) {
										res.json({
											error_code: 401,
											msg: err.toString()
										}); // Database cannot find
										res.status(200).end();
										next(null);
									} else {
										if (user_exist) {
											res.json({
												error_code: 0,
												avatar: user_exist.avatar,
												avatar_small: user_exist.avatar_small,
												username: user_exist.username,
												messages: result
											});
											res.status(200).end();
											next(null);
										} else {
											res.json({
												error_code: 308,
												msg: 'User is not exist'
											}); // User is not exist
											res.status(200).end();
											next(null);
										}
									}
								})
							}

						], function(err) {

						})
					}
				})
			}
		})
	}
}