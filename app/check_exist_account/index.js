var Users           = require('./../../models/users');

module.exports 			=	function(user_id, account_type){
		Users.findOne({_id : user_id}, function(err, user_exist){
			if (err){
				console.log('User khong ton tai');
			} else{
				return (account_type == 2 && user_exist.facebook.id != '') || (account_type == 3 && user_exist.twitter);
			}
		})
}