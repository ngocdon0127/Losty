var   validate_token	= require('./../../app/validate_token');
var   Item          	= require('./../../models/items');
var   User          	= require('./../../models/users');

var   url           	= require('url');
var   fs    			= require('fs');
var   validator     	= require('validator');

module.exports			=	function(req, res){

	// data : {"user" : { "username" : "cuongvc", "token" : "7g1h2b312b3hb12h3h" }, "item_id" : "13j213ub12b39u123"}

	if (!req.rawBody){
		res.json({err : 'Request is incorrect'});
		res.status(200).end();
	} else{
			var data = JSON.parse(req.rawBody);

			var user_id = data.user.user_id;
			var item_id = data.item_id;
			console.log('ITEM_ID : ', item_id);

			// VALIDATE FIELDS
			if (!validator.isAlphanumeric(user_id) || !validator.isAlphanumeric(item_id)){
				res.json({err : 'Validate is not success'});
				res.status(200).end();
			} else{
				validate_token(data.user.user_id, data.user.token, function(valid){
					if (valid){
						// VALIDATE SUCCESS
						Item.findOne({_id : item_id}, function(err, item_exist){
							if (err){
								res.json({err : new Error(err)});
								res.status(200).end();
							} else{

								if (!item_exist){
									// ITEM IS NOT EXIST
									res.json({err : 'Item is not exits'});
									res.status(200).end();
								} else{
									// ITEM IS EXIST
									console.log('authen user_id : ', item_exist.user_id, user_id);
									if (item_exist.user_id != user_id){
										// ITEM KHONG PHAI CUA USER
										res.json({err : "You don't have enough permission to delete this item"});
										res.status(200).end();
									} else{
										// ITEM LA CUA USER, TIEN HANH XOA ITEM VA XOA THONG TIN TREN USER

										// REMOVE ITEM IN INFOR OF USER
										User.findOne({_id : user_id},function(err, user_exist){
											user_exist.Item.pull(item_id);
											user_exist.save(function(err){ });
										});

										// REMOVE IMAGE OF ITEM
			                            fs.unlink(  './public' + url.parse(item_exist.image).path , function(err){
			                                if (err){
			                                    console.error(err);
			                                }
			                            })
										// REMOVE ITEM
										Item.remove({_id : item_id}, function(err, number){
											res.json({err : null, number_remove : number});
											res.status(200).end();
										});
									}
								}
							}
						})
					} else{

						// VALIDATE IS NOT SUCCESS
						res.json({err : 'Authen is not success'});
						res.status(200).end();
					}
				})
			}
	}
}
