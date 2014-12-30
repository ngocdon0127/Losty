var send_mail			=	require('./../../app/send_mail/send_mail_forgot_password');
var bcrypt             = require('bcrypt-nodejs');

var Reset_key     = require('./../../models/reset_keys');
var Users         = require('./../../models/users');

module.exports			=	function(req, res){
	try{
		var data  = req.body;
		// data : {'email' : 'cuongvc93@gmail.com'}
		var email = data.email;
	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	}
	finally{

		Users.findOne({email : email}, function(err, user_exist){
			if (user_exist){
				var key = Math.random().toString(36).substring(2);
				
				var reset_key = new Reset_key();
				reset_key.key = key;
				reset_key.email = email;
				reset_key.save(function(err){
					if (err){
							console.log(err);
					} else{
							send_mail(res, email, key);
							res.json({error_code : 0});
							res.status(200).end();		
					}
				})
			} else{
				res.json({error_code : 200, msg :'User is not exist'});
				res.status(200).end();
			}
		});
	}
}
