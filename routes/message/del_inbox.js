var validate_token         = require('./../../app/validate/validate_token');
var Users                  = require('./../../models/users');
var Messages               = require('./../../models/messages');
var _                                =   require('underscore');


module.exports             = function(req, res){
	try{
		var data = req.body;
		var user_id = data.user.user_id;
		var token = data.user.token;
		var user_chat = data.user.user_chat;
	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	}
	finally{
		validate_token(user_id, token, function(valid){
			if (valid){
				Messages.remove({$or : [{user_send : user_id,       user_recei : user_chat.id}, 
				          						{user_send : user_chat.id, user_recei : user_id}] }, 
				          						function(err, number){
				    if (err){
				    	res.json({error_code : 201, msg : err.toString()});
				    	res.status(200).end();
				    } else{
				    	console.log('Remove all message of ', user_id ,' and ', user_chat);
				    	res.json({error_code : 0});
				    	res.status(200).end();

				    }
				})
			} else{
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});
				res.status(200).end();
			}
		})
	}
}