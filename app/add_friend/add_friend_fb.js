var User                = require('./../../models/users');
var async               = require('async');

module.exports   		=	function(user_id, friends){

	User.findOne({_id : user_id}, function(err, user){
		if (err){
			res.json({error_code : 401, msg : err.toString()});
	    res.status(200).end();			//	database cannot find
		}
		else if (!user){
			res.json({error_code : 401, msg : 'User is not exist'});
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
								if (user_exist){

									user.Friend.push({id 	   : user_exist._id, 
													  avatar   : user_exist.avatar, 
													  username : user_exist.username,
													  avatar_small : user_exist.avatar_small
													});

									user_exist.Friend.push({id           :  user._id,
										 					avatar       :  user.avatar,
										 					avatar_small : user.avatar_small,
										 					username     :  user.username
										 				   });

									user_exist.save(function(err){
										if (err){
											res.json({error_code : 402, msg : err.toString()});
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
							res.json({error_code : 402, msg : err.toString()});
	    				res.status(200).end();			//	database cannot save

						};
					})
				}	
			], function(err){})			
		}
	})
}