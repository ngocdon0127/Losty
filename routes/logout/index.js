var UserAuthen = require('./../../models/user_authens');
var validate_token = require('./../../app/validate/validate_token');
var validator = require('validator');
var Users_online = require('./../../models/users_online');


module.exports = function(req, res) {
	// data : {"user": { "user_id" : "5445bbb95f00451d08016a4f", "token" : "$2a$20$b17NqQiebNug4/h9EnLizO" }}
	try {

		var data = req.body;
		var user_id = data.user.user_id;
		var token = data.user.token;
	} catch (err) {
		res.json({
			error_code: 201,
			msg: err.toString()
		}); //	Input is invalid
		res.status(200).end();
	} finally {

		if (!validator.isAlphanumeric(user_id)) {
			res.json({
				error_code: 201,
				msg: 'Format of user_id is invalid'
			}); //	Input is invalid
			res.status(200).end();
		} else {

			validate_token(user_id, token, function(valid) {
				if (valid) {

					Users_online.remove({
						user_id: user_id
					}, function(err, number) {
						if (err) {
							console.log(err);
						} else {}
					})

					UserAuthen.remove({
						user_id: user_id,
						token: token
					}, function(err) {
						if (err) {
							res.json({
								error_code: 403,
								msg: err.toString()
							}); //	Database cannot remove
							res.status(200).end();
						} else {
							res.json({
								error_code: 0
							});
							res.status(200).end();
						}
					})
				} else {
					res.json({
						error_code: 100,
						msg: 'Authenticate is incorrect'
					}); // Authenticate is incorrect
					res.status(200).end();
				}
			})
		}
	}
}