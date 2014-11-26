var send_mail			=	require('./../../app/send_mail/send_mail');
var bcrypt             = require('bcrypt-nodejs');

var Reset_key     = require('./../../models/reset_keys');

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
	}
}
