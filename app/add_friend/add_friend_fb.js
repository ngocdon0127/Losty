var User                = require('./../../models/users');
var async               = require('async');

module.exports   		=	function(user_id, friends){

	User.findOne({_id : user_id}, function(err, user){
		if (err || !user){
			res.json({error_code : 401});
	    	res.status(200).end();			//	database cannot find

		}
		else {
			async.waterfall([
				function(next){
					friends.forEach(function(friend){
						User.findOne({'facebook.id' : friend.id }, function(err, user_exist){
							if (err){
								console.log(err);
							} else{
								console.log('User_exist : ', user_exist);
								if (user_exist){

									user.Friend.push({id 	   : user_exist._id, 
													  avatar   : user_exist.avatar, 
													  username : user_exist.username
													});

									user_exist.Friend.push({id           :  user._id,
										 					avatar       :  user.avatar,
										 					username     :  user.username
										 				   });

									user_exist.save(function(err){
										if (err){
											res.json({error_code : 402});
	    									res.status(200).end();			//	database cannot save
										}
										next(null);
									})
								}
							}
						})
					});
				},
				function(next){
					user.save(function(err){
						if (err){
							res.json({error_code : 402});
	    					res.status(200).end();			//	database cannot save

						};
					})
				}	
			], function(err){})			
		}
	})
}