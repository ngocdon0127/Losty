var send_mail			=	require('./../../app/send_mail/send_mail');

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
		send_mail(email);
		res.json({error_code : 0});
		res.status(200).end();
	}
}
