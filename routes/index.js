exports.login               =   require('./login');         
exports.register            =   require('./register');
exports.logout				=	require('./logout');

exports.item      			=   require('./item');

exports.category     		=   require('./category');

exports.upload_photo		=	require('./upload_photo');

exports.recent				=	require('./recent');



exports.index = function(req, res){
    res.json('get /');
}