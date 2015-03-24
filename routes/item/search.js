var Item = require('./../../models/items');
var Category = require('./../../models/categores');

var validator = require('validator');

module.exports = function(req, res) {
	try {
		var data = req.body;

		// data : {"keyword", "type", "start", "limit"}

		var keyword = data.keyword.toLowerCase();
		var type = data.type;
		var start = data.start;
		var limit = data.limit;
	} catch (err) {
		res.json({
			error_code: 201,
			msg: err.toString()
		}); // Input is valid
		res.status(200).end();
	} finally {

		if (!validator.isNumeric(type)) {
			res.json({
				error_code: 201,
				msg: 'Type is not number'
			}); // Input is valid
			res.status(200);
		} else {
			Item.find({}, function(err, items) {
				if (err) {
					res.json({
						error_code: 401,
						msg: err.toString()
					}); //Database cannot find
					res.status(200).end();
				}
				var result = [];

				items.forEach(function(item) {

					if (item.description) {
						var description = item.description.toLowerCase();
					} else var description = '';

					if (item.title) {
						var title = item.title.toLowerCase();
					} else var title = '';

					if (item.category) {
						var category = item.category.toLowerCase();
					} else var category = '';

					if (item.type == type &&
						(category.indexOf(keyword) != -1 || description.indexOf(keyword) != -1 || title.indexOf(keyword) != -1)) {
						result.push(item);
					};
				})

				process.nextTick(function() {
					res.json({
						error_code: 0,
						items: result.slice(start, start + limit)
					});

					res.status(200).end();
				})
			})
		}
	}
}