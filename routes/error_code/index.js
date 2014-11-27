

module.exports			=	function(req, res){
	var error_code	  = parseInt(req.params.error_code);
	var msg 					= ''

	switch(error_code)
	{

	case 100:
  	msg = 'Authenticate is incorrect';	
  	break;

  case 101:
  	msg = 'Access_token is incorrect';
  	break;

  case 201:
  	msg = 'Input is invalid';
  	break;

  case 202:
  	msg = 'Image link is incorrect';
  	break;

  case 203:
  	msg = 'Extension of file is incorrect';
  	break;

  case 204:
  	msg = 'Location is incorrect';
  	break;

  case 301:
  	msg = 'Email is incorrect';
  	break;

  case 302:
  	msg = 'Password is incorrect';
  	break;

  case 303:
  	msg = 'Email is really exist';
  	break;

  case 304:
  	msg = 'Photo is not exist';
  	break;

  case 305:
  	msg = 'Item is not exist';
  	break;

  case 306:
  	msg = 'Image is not exist';
  	break;

  case 307:
  	msg = 'Category is not exist';
  	break;

  case 308:
  	msg = 'User is not exist';
  	break;

  case 401:
  	msg = 'Database cannot find';
  	break;

  case 402:
  	msg = 'Database cannot save';
  	break;

  case 403:
  	msg = 'Database cannot remove';
  	break;

  case 500:
  	msg = 'Not have enough permission';
  	break;

  case 600:
    msg = 'Account was deactive';
    break;

	default:
	  msg = 'Error_code is incorrect';
	  break;
	}

	res.json({msg : msg});
	res.status(200).end();

}