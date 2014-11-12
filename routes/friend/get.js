var User				=	require('./../../models/users');
var validate_token		=	require('./../../app/validate/validate_token');

module.exports			=	function(req, res){
	try{
		var data = JSON.parse(req.rawBody);
		// data : {"user"  : {"user_id", "token"}}

		var user_id = data.user.user_id;
		var token	= data.user.token;
	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});					// Input is invalid
		res.status(200).end();

	}	
	finally{
		validate_token(user_id, token, function(valid){
			if (!valid){
				res.json({error_code : 100});			//	Authenticate is incorrect
				res.status(200).end();
			}else{
				User.findOne({_id : user_id}, function(err, user_exist){
					if (err){
						res.json({error_code : 401, msg : err.toString()});	//  Database cannot find
						res.status(200).end();
					} else if (user_exist){
						res.json({error_code : 0, friends : user_exist.Friend});
						res.status(200).end();
					} else{
						res.json({error_code : 308, msg : 'User is not exist'});
						res.status(200).end();
					}
				})
			}
		});
	}
}