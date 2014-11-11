var validate_token			=	require('./../../app/validate_token');

var Message               	=	require('./../../models/messages');
var User                	=	require('./../../models/users');

module.exports				=	function(req, res){
	try{
		// data : { "user" : {"user_id" , "token" }, "friend_id", "start", "limit" }
		var data 		= JSON.parse(req.rawBody);
		var user_id 	= data.user.user_id;
		var token   	= data.user.token;	
		var friend_id 	= data.friend_id;
		var start     	= data.start;
		var limit     	= data.limit;
	}
	catch(e){
		res.json({error_code : 201});												//	Input is invalid
		res.status(200).end();
	}	
	finally{
		validate_token(user_id, token, function(valid){
			if (!valid){
				res.json({error_code : 100});										// Authenticate is incorrect
				res.status(200).end();
			} else{
				Message.find({$or : [{user_send : user_id, user_recei : friend_id}, 
									{user_send : friend_id, user_recei : user_id}] }, function(err, messages){
					if (err){
						res.json({error_code : 401});								// Database cannot find
						res.status(200).end();
					} else{
						var result = messages.slice(start, start + limit);
						User.findOne({_id : friend_id}, function(err, user_exist){
							if (err){
								res.json({error_code : 401});						// Database cannot find
								res.status(200).end();
							} else{
								if (user_exist){
									res.json({ error_code : 0, 
										       avatar : user_exist.avatar, 
										       username : user_exist.username, 
										       messages : result});
									res.status(200).end();
								} else{
									res.json({error_code : 308});					// User is not exist
									res.status(200).end();
								}
							}
						})	
					}
				})
			}
		})
	}
}