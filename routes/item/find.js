// Find item with category, title, date, location

var Items                =    require('./../../models/items');
var distance   				   = 		require('./../../app/map/distance');
var distance_max         = 		100.0;
var async                =    require('async');

function convert_time_to_GMT(time){
	return new Date(new Date(time).toGMTString()).toJSON();
}

function check_day(time1, time2, timezone){
	console.log(timezone);
	time1 = new Date(time1);
	time2 = new Date(time2);
	// convert time1 and time2 to TIMEZONE of user
	console.log(time1, time2);
	time1.setHours(time1.getHours() + timezone + 5);
	time2.setHours(time1.getHours() + timezone + 5);
	console.log(time1, time2);
	console.log(time1.getMonth(), time2.getMonth());
	console.log(time1.getDate(), time2.getDate());
	console.log(time1.getFullYear(), time2.getFullYear());

	if (time1.getMonth() == time2.getMonth() && 
			time1.getDate()  == time2.getDate() && 
			time1.getFullYear() == time2.getFullYear())
			return 1
	else 
			return 0
}

module.exports           =    function(req, res){
	try{
		// data :  	 "location" : { "lat"  : 21.027387, "lng"  : 105.850907 }, 
 		//					 "category_id" : "..",  "title" : "dog", 
 		// 					 "date" : "..",  "type" : "2"}

		var data 		 		= req.body;
		var location 		= data.location;
		var category_id = data.category_id;
		var date_lost 	= convert_time_to_GMT(data.date);
		var title     	= data.title;
		var type 				= data.type;
		var timezone    = data.timezone;
	}
	catch(err){
		res.json({error_code : 200, msg : 'Input is invalid'});
		res.status(200).end();
	}
	finally{
		var items = [];
		Items.find({type : type, category_id : category_id}, function(err, items_exist){
			if (err){
				res.json({error_code : 401, msg : err.toString()});
				res.status(200).end();
			} else{
				async.waterfall([
					function(next){
						items_exist.forEach(function(item){
							if (item.title.toLowerCase().indexOf(title.toLowerCase()) != -1){
								console.log('distance : ', distance(item.location, location));
								if (distance(item.location, location) <= distance_max){
									if (check_day(item.date_lost, date_lost , timezone) ){
										items.push(item);
									}
								}
							}
						})
						setTimeout(function(){
							next(null);						
						}, 100);
					}
					],function(err){
						res.json({error_code : 0, items : items});
						res.status(200).end();
					}
				);
			}
		})
	}	
}