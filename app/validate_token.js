var UserAuthen = require('./../models/user_authens');

module.exports = function(user_id, token, callback){
	console.log('validate : ', user_id, token);
    UserAuthen.findOne({user_id : user_id, token : token}, function(err, token_exist){
    	console.log('token_exist : ', token_exist);
        if (token_exist){
        	callback(1);
        } else{
        	callback(0);	
        }
        
    })
}