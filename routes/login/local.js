var User            = require('./../../models/users');
var make_token    = require('./../../app/authen/make_token');

var validator       = require('validator');
var bcrypt          = require('bcrypt-nodejs');

var domain 					=	require('domain').create();

module.exports = function(req, res){

	domain.on('error', function(error){
 		console.log('Have error :', error.toString());
    res.json({error_code : 201, msg : error.toString()});
    res.status(200).end();
    return;
  })

  domain.run(function(){
	  	var data = req.body;
	    // data : {"user": { "email" : "...", "password" : "..." }}
	    var email = data.user.email;
	    var password = data.user.password;	

			if (typeof(email) == 'undefined' || typeof(password) == 'undefined'){
				domain.emit('error', 'Input is invalid');
				return 0;
			}

	    if (!validator.isEmail(email)){
	    	domain.emit('error', 'Email is incorrect');

	    } else if (!validator.isLength(password, 6, 25) ){
	      domain.emit('error', 'Length of password is incorrect');

	    } else{
	    	User.findOne({email : email}, function(err, user_exist){

	        if (err) {
	        	domain.emit('error', err.toString());
	        } 

	        else if (!user_exist) {
	        	console.log('User is not exist');
	        	domain.emit('error', 'User is not exist');

	        } else {
	        	if (!user_exist.validPassword(password)){
	        		domain.emit('error', 'Password is incorrect');

	          } else if (!user_exist.active){
	        		domain.emit('error', 'Account was deactive');

	          } else{
	          	make_token(user_exist, res);
	          }
	        }
	      })          
   	  }

  })			 
}