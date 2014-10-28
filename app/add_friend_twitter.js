var User                = require('./../models/users');
var async               = require('async');

module.exports   		=	function(user_id, friends){


	User.findOne({_id : user_id}, function(err, user){
		if (err || !user){
			console.log(err);
		}
		else {
			console.log('Have exist user : ', user);

			async.waterfall([
				function(next){
					friends.forEach(function(friend){
						User.findOne({'twitter.id' : friend.id }, function(err, user_exist){
							if (err){
								console.log(err);
							} else{
								console.log('Friend is exist : ', user_exist);
								if (user_exist){

									user.Friend.push({id 	   : user_exist._id, 
													  avatar   : user_exist.avatar, 
													  username : user_exist.username
													});

									user_exist.save(function(err){
										if (err){
											console.log(err);
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
							console.log(err);
						};
					})
				}	
			], function(err){})			
		}
	})
}