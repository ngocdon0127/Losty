Photo					=	require('./../../models/photos');
var validate_token		=	require('./../../app/validate_token');

module.exports 			=	function(req, res){
	try{
		var data = JSON.parse(req.rawBody);

		// data : {"user"  : {"user_id", "token"}}
		var user_id = data.user.user_id;
		var token	= data.user.token;
	}
	catch(e){
		res.json({error_code : 201});			//	Input is invalid
		res.status(200).end();
		console.log(e);
	}
	finally{
		validate_token(user_id, token, function(valid){
			if (!valid){
				res.json({error_code : 100});			//	Authenticate is incorrect
				res.status(200).end();
			}else{
				Photo.find({user_id : user_id}, function(err, photos){
					if (err){
						res.json({error_code : 401});	//  Database cannot find
						res.status(200).end();
					} else{
						res.json({error_code : 0, photos : photos});
						res.status(200).end();
					}
				})
			}
		});
	}
}