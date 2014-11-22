exports.login               =   require('./login');         

exports.register            =   require('./register');

exports.logout							=		require('./logout');

exports.item      					=   require('./item');

exports.category     				=   require('./category');
	
exports.upload_photo				=		require('./upload_photo');

exports.recent							=		require('./recent');

exports.photo								=   require('./photo');

exports.friend							=   require('./friend');

exports.forgot_password     =   require('./forgot_password');

exports.message             =   require('./message');

exports.error_code          =   require('./error_code');

exports.sync_account				=   require('./sync_account');

exports.index = function(req, res){
    res.json('get /');
}