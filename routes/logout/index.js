var UserAuthen		=	require('./../../models/user_authens');
var validate_token  = 	require('./../../app/validate_token');

module.exports = function(req, res){
	// data : {"user": { "user_id" : "5445bbb95f00451d08016a4f", "token" : "$2a$20$b17NqQiebNug4/h9EnLizO" }}
    var data = JSON.parse(req.rawBody).user;
	console.log(data);

	// validate_token : callback(valid), valid = 1 -> validate success.
	//									 valid = 0 -> validate fail

	validate_token(data.user_id, data.token, function(valid){
		console.log('valid : ' , valid);
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
			console.log('khong validate_token duoc');
			res.json({err : new Error("Authenticate incorrect")});
			res.status(200).end();
		}
	})
}