// ================================ RETURN ITEMS NEAR USER ==========================

var Item  	   		= require('./../../models/items');

var distance   		= require('./../../app/distance');
var validate_token 	= require('./../../app/validate_token');
var google_map      = require('./../../app/google_map');

module.exports = function(req, res){
	try{
		// data : {"user" : {"user_id", "token"}, "location", "start", "limit"}

		var data    	= JSON.parse(req.rawBody);

		var user_id 	= data.user.user_id;
		var token   	= data.user.token;
		var location	= data.location;

		var start       = data.start;	// default = 0
		var limit       = data.limit;   // default = 20;
	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	}

	finally{
			
		validate_token(user_id, token, function(valid){
			if (!valid){

				// VALIDATE IS NOT SUCCESS
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});				// Authenticate is incorrect
				res.status(200).end();

			} else{

				// find all item is near this user
				Item.find({}, function(err, items){
					if (err){
						res.json({error_code : 401, msg : err.toString()});	// Database cannot find
						res.status(200).end();
					} else{
						items.sort(function(a, b){
							return distance(location, a.location) > distance(location, b.location);
						})
						var distances = [];

						process.nextTick(function(){
							items.forEach(function(item){
								distances.push(distance(location, item.location));
							})

							process.nextTick(function(){
								res.json({error_code : 0, items : items.slice(start, start + limit), 
										  distances : distances.slice(start, start + limit)});
								res.status(200).end();	
							})
						})
					}
					
				})
			}
		})
	}
}

