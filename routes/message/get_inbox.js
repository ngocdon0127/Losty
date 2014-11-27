var validate_token    = require('./../../app/validate/validate_token');

module.exports 				=	function(req, res){
	try{
		var data = req.body;
		// data : {user : {user_id, token }}
		var user_id = data.user.user_id;
		var token   = data.user.token;
	}

	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	}

	finally{
		validate_token(user_id, token, function(valid){
			if (valid){
				
			} else{
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});
				res.status(200).end();
			}
		})
	}
}