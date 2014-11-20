var Photo					=	require('./../../models/photos');
var validate_token		=	require('./../../app/validate/validate_token');

module.exports 			=	function(req, res){
	try{
		var data = req.body;

		// data : {"user"  : {"user_id", "token"}}
		var user_id = data.user.user_id;
		var token	= data.user.token;
	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});			//	Input is invalid
		res.status(200).end();
	}
	finally{
		validate_token(user_id, token, function(valid){
			if (!valid){
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});			//	Authenticate is incorrect
				res.status(200).end();
			}else{
				Photo.find({user_id : user_id}, function(err, photos){
					if (err){
						res.json({error_code : 401, msg : err.toString()});	//  Database cannot find
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