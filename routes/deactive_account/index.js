var Users							=		require('./../../models/users');
var validate_token    =   require('./../../app/validate/validate_token');

module.exports				=		function(req, res){
	try{
		var data = req.body;
		var user_id = data.user.user_id;
		var token   = data.user.token;
	}

	catch(err){
		res.json({error_code : 201, msg : 'Input is invalid'});
		res.status(200).end();
	}

	finally{	
		validate_token(user_id, token, function(valid){
			if (!valid){
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});
				res.status(200).end();
			} else{
				Users.findOne({_id : user_id}, function(err, user_exist){
					if (err){

						res.json({error_code : 401, msg : err.toString()});
						res.status(200).end();

					} else if (!user_exist){

						res.json({error_code : 308, msg : 'User is not exist'});
						res.status(200).end();						

					} else{

						user_exist.active = 0;
						user_exist.save(function(err){
							res.json({error_code : 0, msg : 'Account was deactive'});
							res.status(200).end();
						});

					}
				})
			}
		})
	}
}