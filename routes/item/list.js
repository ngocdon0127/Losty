var Items = require('./../../models/items');
var Users = require('./../../models/users');

var validate_token = require('./../../app/validate/validate_token');


module.exports = function(req, res) {
	try {
		var data = req.body;
		var user_id = data.user.user_id;
		var token = data.user.token;
	} catch (err) {
		res.json({
			error_code: 201,
			msg: err.toString()
		});
		res.status(200).end();
	} finally {
		validate_token(user_id, token, function(valid) {
			if (!valid) {
				res.json({
					error_code: 100,
					msg: 'Authenticate is incorrect'
				});
				res.status(200).end();
			} else {
				Items.find({
					'user.id': user_id
				}, function(err, item_exist) {
					if (err) {
						res.json({
							error_code: 201,
							msg: err2.toString()
						});
						res.status(200).end();
					} else {
						res.json({
							error_code: 0,
							items: item_exist
						});
						res.status(200).end();
					}
				})
			}
		});
	}
}