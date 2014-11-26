var Users = require('./../../models/users');
var Reset_keys = require('./../../models/reset_keys');
var bcrypt             = require('bcrypt-nodejs');

var email;

module.exports    = function(req, res){
	try{
		var data = req.body;	
		var key  = data['Reset key'];
		var new_password = data['New password'];
		var password     = data.password;
		if (new_password != password){
			throw new Error('Passwords is not compare');
		}
	}

	catch(err){
		if (err){
			res.json({message : 'Have error : '+ err.toString()});
			res.status(200).end();
		}
	}

	finally{
		console.log(key);
		Reset_keys.findOne({key : key}, function(err, reset_key){
			console.log(reset_key);
			email = reset_key.email;
			console.log(email);
			Users.findOne({email : email}, function(err, user_exist){
				if (err){
					res.json({message : 'Have error : '+ err.toString()});
					res.status(200).end();
				} else if(!user_exist){
					res.json({message : 'Have error : Email is not exist'});
					res.status(200).end();

				} else{

					user_exist.password =  bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
					user_exist.save(function(err){

					});
				}
			})
		})
	}
	
	
}