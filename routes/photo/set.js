
var validate_token      = require('./../../app/validate_token');
var validate_extension  = require('./../../app/validate_extension');
var domain        		= require('./../../config/default').domain_default;

var User                = require('./../../models/users');
var Photo               = require('./../../models/photos');                

var fs                  = require('fs');
var validator           = require('validator');


module.exports 			=	function(req, res){
	if (!req.rawBody){
		res.json({err : 'Request is incorrect'});
		res.status(200).end();
	} else {

		// data : {"user" : {"user_id", "token"}, "name", "image_link", "extension"}
		var data  	   = JSON.parse(req.rawBody);

		var name  	   = data.name;
		var image_link = data.image_link;
		var extension  = data.extension;

		var user_id	   = data.user.user_id;
		var token      = data.user.token;

		if (!validator.isAlphanumeric(user_id)){
			res.json({err : 'Request is incorrect'});
			res.status(200).end();
		} else{
			validate_token(user_id, token, function(valid){

				if (!valid){
					// VALIDATE IS NOT SUCCESS
					res.json({err : 'Authenticate is not success'});
					res.status(200).end();

				} else{
					// VALIDATE IS SUCCESS
					if(!image_link || !fs.existsSync(image_link)){
						res.json({err : 'Can not find image'});
						res.status(200);
					} else{
						if (!validate_extension(image_link, extension)){
							res.json({err : 'File must is image'});
							res.status(200).end();
						} else{

							// CREATE PHOTO
							var photo = new Photo;
							photo.name = name;

							var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() + '.' + extension;
	                        var new_location = '/img/photo/';

	                        // SAVE PHOTO
							fs.rename(image_link, './public' + new_location + file_name, function(err){
								if (err){
									res.json({err : new Error(err)});
									res.status(200).end();
								} else{
									photo.image_link = domain + new_location + file_name;
									photo.user_id    = user_id;
									photo.save(function(err){
										if (err){
											res.json({err : new Error(err)});
											res.status(200).end();
										} else{
											process.nextTick(function(){
												res.json({err : null, photo : photo});
												res.status(200).end();

												// SAVE PHOTO INTO USER INFOR
												User.findOne({_id : user_id}, function(err, user_exist){
													if (err){
														console.log(err);
														res.json({err : new Error(err)});
														res.status(200).end();
													} else{
														user_exist.Photo.push(photo._id);
														user_exist.save(function(err){
															if (err){
																console.log(err);
															}
														});
													}
												})
											})
										}
									});
								}
							})
						}
					}
				}
			})
		}
			
	}
}