// ================================ RETURN ITEMS NEAR USER ==========================

var Item  	   		= require('./../../models/items');

var distance   		= require('./../../app/distance');
var validate_token 	= require('./../../app/validate_token');

module.exports = function(req, res){


	if (!req.rawBody){

		res.json({err : 'request is incorrect'});
		res.status(200).end();

	} else{
		var data    	= JSON.parse(req.rawBody);

		var user_id 	= data.user.user_id;
		var token   	= data.user.token;
		var location	= data.location;

		validate_token(user_id, token, function(valid){
			if (valid){
				// find all item is near this user
				Item.find({}, function(err, items){
					items.forEach(function(item){
						console.log(distance(item.location, location));
						
					})
				})
			} else{
				res.json({err : 'Validate user is not success'});
				res.status(200).end();
			}
		})
	}
}

