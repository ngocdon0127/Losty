var   validate_token	= require('./../../app/validate_token');
var   Item          	= require('./../../models/items');
var   User          	= require('./../../models/users');

var   url           	= require('url');
var   fs    			= require('fs');
var   validator     	= require('validator');

module.exports			=	function(req, res){

	// data : {"user" : { "username" : "cuongvc", "token" : "7g1h2b312b3hb12h3h" }, "item_id" : "13j213ub12b39u123"}

	try{
		var data = JSON.parse(req.rawBody);
		var user_id = data.user.user_id;
		var item_id = data.item_id;
	}
	catch(e){
		res.json({error_code : 201});					// Input is invalid
		res.status(200).end();
	}
	finally{

			// VALIDATE FIELDS
			if (!validator.isAlphanumeric(user_id) || !validator.isAlphanumeric(item_id)){
				res.json({error_code : 201});		// Input is invalid
				res.status(200).end();
			} else{
				validate_token(data.user.user_id, data.user.token, function(valid){
					if (valid){
						// VALIDATE SUCCESS

						Item.findOne({_id : item_id}, function(err, item_exist){
							if (err){
								console.log(err);
								res.json({error_code : 305});		// Item is not exist
								res.status(200).end();
							} else{

								if (!item_exist){
									// ITEM IS NOT EXIST
									res.json({error_code : 305});	// Item is not exist
									res.status(200).end();
								} else{
									// ITEM IS EXIST
									if (item_exist.user_id != user_id){
										// ITEM KHONG PHAI CUA USER
										res.json({error_code : 500});	// Not have permission
										res.status(200).end();
									} else{
										// ITEM LA CUA USER, TIEN HANH XOA ITEM VA XOA THONG TIN TREN USER

										// REMOVE ITEM IN INFOR OF USER
										User.findOne({_id : user_id},function(err, user_exist){
											if (err){
												console.log(err);
												res.json({error_code : 401});	//Database cannot find
												res.status(200).end();
												return 1;
											} else{
												user_exist.Item.pull(item_id);
												user_exist.save(function(err){ });		
											}
										});
										// REMOVE IMAGE OF ITEM
			                            fs.unlink(  './public' + url.parse(item_exist.image_link).path , function(err){
			                                if (err){
			                                    res.json({error_code : 306});
			                                    res.status(200).end();
			                                    return 1;
			                                }
			                            })
										// REMOVE ITEM
										Item.remove({_id : item_id}, function(err, number){
											if (err){
												res.json({error_code : 403});	// Database cannot remove
												res.status(200).end();
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
						res.json({error_code : 100});		//	Authenticate is incorrect
						res.status(200).end();
					}
				})
			}
	}
}
