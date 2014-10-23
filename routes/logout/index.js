var UserAuthen		=	require('./../../models/user_authens');
var validate_token  = 	require('./../../app/validate_token');
var validator       =   require('validator');

module.exports = function(req, res){
	// data : {"user": { "user_id" : "5445bbb95f00451d08016a4f", "token" : "$2a$20$b17NqQiebNug4/h9EnLizO" }}
	if (!req.rawBody){
		res.json({err : 'Request is incorrect'});
		res.status(200).end();
	} else{

		var data = JSON.parse(req.rawBody).user;


		if (!validator.isAlphanumeric(data.user_id)){
			res.json({err : 'Validate is not success'});
			res.status(200).end();
		} else{
			validate_token(data.user_id, data.token, function(valid){	
				if (valid){
					UserAuthen.remove({user_id : data.user_id, token : data.token}, function(err){
						if (err){
							console.error(err);
							res.json({err : new Error("Can not Authenticate")});
							res.status(200).end();
						} else{
							console.log('Remove complated');
							res.json({err : null});
							res.status(200).end();
						}
					})
				} else{
					res.json({err : new Error("Authenticate incorrect")});
					res.status(200).end();
				}
			})		
		}
		
	}
    
}