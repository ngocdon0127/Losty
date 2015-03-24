// Return all category

var Category = require('./../../models/categores');

module.exports = function(req, res) {
	Category.find({}, function(err, categores) {
		if (err) {
			res.json({
				error_code: 401,
				msg: err.toString()
			}); // Database cannot find
			res.status(200).end();
		} else {
			res.json({
				error_code: 0,
				categores: categores
			});
			res.status(200).end();
		}

	})
}