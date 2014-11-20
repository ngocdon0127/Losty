var validator 			=	require('validator');

var Items						=	require('./../../models/items');
var Users						=	require('./../../models/users');
var validate_token	=	require('./../../app/validate/validate_token');

module.exports		=	function(req, res){
	try{

		var data	  =	JSON.parse(req.rawBody);
		var user_id = data.user.user_id;
		var token   = data.user.token;
		var item_id = data.item_id;
	}

	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	}

	finally{
		if (!validator.isAlphanumeric(user_id) || !validator.isAlphanumeric(item_id)){

			res.json({error_code : 201, msg : 'user_id or item_id is incorrect'});
			res.status(200).end();

		} else{
			Items.findOne({_id : item_id}, function(err, item_exist){
				if (err){

					res.json({error_code : 401, msg : err.toString()});
					res.status(200).end();

				} else{
					if (item_exist){		// ADD USER TO LIST PEOPLE VIEW ITEM
						if (item_exist.people_view.indexOf(user_id) == -1){
							// ADD AVATAR, USERNAME, ID OF USER VIEW
							Users.findOne({_id : user_id}, function(err, user_exist){

								if (err || !user_exist){

									res.json({error_code : 201, msg : err.toString()});
									res.status(200).end();
									
								} else{

									item_exist.people_view.push({
											id 			: user_id, 
											avatar 	: user_exist.avatar, 
											username: user_exist.username});

									item_exist.save(function(err){
										if (err){
											console.log(err.toString());
										} else{
											res.json({error_code : 0});
											res.status(200).end();
										}
									})		
								}
								

							});
							
						} else{
							res.json({error_code : 0});
							res.status(200).end();
						}
					}
					else{
						res.json({error_code : 305, msg : 'Item is not exist'});
						res.status(200).end();
					}
				}
			})
		}
	}
}