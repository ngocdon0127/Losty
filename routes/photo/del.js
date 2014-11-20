var   validate_token	= require('./../../app/validate/validate_token');
var   Photo          	= require('./../../models/photos');
var   User          	= require('./../../models/users');

var   url           	= require('url');
var   fs    					= require('fs');
var   validator     	= require('validator');

module.exports			=	function(req, res){

	// data : {"user" : { "username" : "cuongvc", "token" : "7g1h2b312b3hb12h3h" }, "item_id" : "13j213ub12b39u123"}

	try{
		var data = JSON.parse(req.rawBody);
		var user_id = data.user.user_id;
		var photo_id = data.photo_id;
	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});			//	Input is invalid
		res.status(200).end();
	}
	finally{
	
			// VALIDATE FIELDS
			if (!validator.isAlphanumeric(user_id) || !validator.isAlphanumeric(photo_id)){
				res.json({error_code : 201, msg : 'User_id or photo_id is incorrect'});			//	Input is invalid
				res.status(200).end();
			} else{
				validate_token(data.user.user_id, data.user.token, function(valid){
					if (valid){
						// VALIDATE SUCCESS
						Photo.findOne({_id : photo_id}, function(err, photo_exist){
							if (err){
								res.json({error_code : 401, msg : err.toString()});			//	Database cannot find
								res.status(200).end();
							} else{

								if (!photo_exist){
									// Photo IS NOT EXIST
									res.json({error_code : 304, msg : 'Photo is not exist'});			//	Photo is not exist
									res.status(200).end();
								} else{
									// Photo IS EXIST
									if (photo_exist.user_id != user_id){

										// Photo KHONG PHAI CUA USER
										
										res.json({error_code : 500, msg : 'Not have enough permission'});		// Not have enough permission
										res.status(200).end();
									} else{

										// Photo LA CUA USER, TIEN HANH XOA ITEM VA XOA THONG TIN TREN USER

										// REMOVE ITEM IN INFOR OF USER
										User.findOne({_id : user_id},function(err, user_exist){
											if (err){
												res.json({error_code : 401, msg : err.toString()}); // Database cannot save
												res.status(200).end();
												return 1;
											} else{
												user_exist.Photo.pull(photo_exist);
												user_exist.save(function(err){ 
													if (err){
														res.json({error_code : 402, msg : err.toString()}); // Database cannot save
														res.status(200).end();
													}
												});		
											}
											
										});

										// REMOVE IMAGE OF ITEM
			              fs.unlink(  './public' + url.parse(photo_exist.image_link).path , function(err){
			                if (err){
			                  res.json({error_code : 306, msg : err.toString()})	//	image is not exist
			                  res.status(200).end();
			                  return 1;
			                }
			              })
										// REMOVE ITEM
										Photo.remove({_id : photo_id}, function(err, number){
											if (err){
												res.json({error_code : 403, msg : err.toString()});	// Database cannot remove
												res.status(200).end();	
												return 1;
											} else{
												res.json({error_code : 0});
												res.status(200).end();	
											}
										});
									}
								}
							}
						})
					} else{
						// VALIDATE IS NOT SUCCESS
						res.json({error_code : 100, msg : 'Authenticate is incorrect'});			// Authenticate is incorrect
						res.status(200).end();
					}
				})
			}
	}
}
