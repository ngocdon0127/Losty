// ================================ RETURN ITEMS NEAR USER ==========================


var Item  	   					= require('./../../models/items');

var distance   					= require('./../../app/map/distance');
var validate_token 			= require('./../../app/validate/validate_token');
var validate_location 	= require('./../../app/validate/validate_location');
var async								= require('async');

var distance_max        = 100.0;

// Rounding num with ext numbers
function round_f(num,ext){
	//num: so can lam tron
	//ext: phan thap phan
	var tmp=Math.pow(10, Math.round(ext));
	return (Math.round(num*tmp)/tmp);
}

module.exports = function(req, res){
	try{
		// data : {"user" : {"user_id", "token"}, "location", "start", "limit"}

		var data    	= req.body;

		var user_id 	= data.user.user_id;
		var token   	= data.user.token;
		var location	= data.location;
		// if (!validate_location(location))
  //           throw Error('Location is invalid');

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
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});
				res.status(200).end();

			} else{
				// find all item is near this user
				Item.find({}, function(err, items){
					if (err){
						res.json({error_code : 401, msg : err.toString()});	// Database cannot find
						res.status(200).end();
					} else{
						async.waterfall([
							function(next){	

   							items.sort(function(a, b){
								 	return distance(location, a.location) - distance(location, b.location);
								})

								setInterval(function(){
									next(null);
								}, 1000);
							},

							function(next){

								console.log('********************');
								console.log('item : ', items);

								for (var i = 0 ; i  < items.length ; i ++){
									console.log(i, ' : ', items[i].title)
									console.log(distance(items[i].location, location));
									if (distance(items[i].location, location) > distance_max){
										console.log('Remove ', items[i].title);
										items.splice(i, 1);
									};
								};
								next(null);
							},

							function(next){
								
								distances = [];

								process.nextTick(function(){
									
									items.forEach(function(item){
										distances.push(round_f(distance(location, item.location), 1 ));
									})

									process.nextTick(function(){
										res.json({error_code : 0, items : items.slice(start, start + limit), 
												  distances : distances.slice(start, start + limit)});
										res.status(200).end();	
										next(null);
									})
								})
							}
						], function(err){});
					}					
				})
			}
		})
	}
}

