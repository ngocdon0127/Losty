// ================================ RETURN ITEMS NEAR USER ==========================

var Item  	   		= require('./../../models/items');

var distance   		= require('./../../app/distance');
var validate_token 	= require('./../../app/validate_token');
var google_map      = require('./../../app/google_map');

module.exports = function(req, res){
	if (!req.rawBody){
		res.json({err : 'Request is incorrect'});
		res.status(200).end();

	} else{

		// data : {"user" : {"user_id", "token"}, "location", "start", "limit"}

		var data    	= JSON.parse(req.rawBody);

		var user_id 	= data.user.user_id;
		var token   	= data.user.token;
		var location	= data.location;

		var start       = data.start;	// default = 0
		var limit       = data.limit;   // default = 20;

		validate_token(user_id, token, function(valid){
			if (!valid){

				// VALIDATE IS NOT SUCCESS
				res.json({err : 'Validate user is not success'});
				res.status(200).end();

			} else{

				// find all item is near this user
				Item.find({}, function(err, items){

					items.sort(function(a, b){
						return distance(location, a.location) > distance(location, b.location);
					})
					var distances = [];

					process.nextTick(function(){
						items.forEach(function(item){
							console.log(item.description, ' ' , distance(location, item.location));
							distances.push(distance(location, item.location));

						})

						process.nextTick(function(){
							res.json({err : null, items : items.slice(start, start + limit), 
									  distances : distances.slice(start, start + limit)});
							res.status(200);	
						})
					})
				})
			}
		})
	}
}

