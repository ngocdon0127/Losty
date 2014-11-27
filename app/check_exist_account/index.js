var Users           = require('./../../models/users');

// check user have account_type
module.exports 			=	function(account_type, user_id, callback){
		Users.findOne({_id : user_id}, function(err, user_exist){
			if (err){
				console.log('User khong ton tai');
			} else{
				callback ((account_type == 2 && user_exist.facebook.id != '') || (account_type == 3 && user_exist.twitter.id != ''));
			}
		})
}