exports.login               =   require('./login');         
exports.register            =   require('./register');
exports.item      			=   require('./item');
exports.category     		=   require('./category');
exports.logout				=	require('./logout');
exports.recent				=	require('./recent');


exports.index = function(req, res){
    res.json('get /');
}