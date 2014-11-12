var send_mail			=	require('./../../app/send_mail/send_mail');

module.exports			=	function(req, res){
	send_mail();	
	res.end();
}
