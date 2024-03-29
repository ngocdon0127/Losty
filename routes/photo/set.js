var validate_token = require('./../../app/validate/validate_token');
var validate_extension = require('./../../app/validate/validate_extension');
var domain = require('./../../config/default').domain_default;

var User = require('./../../models/users');
var Photo = require('./../../models/photos');

var fs = require('fs');
var validator = require('validator');
var resize_small = require('./../../app/file/resize_small');
var resize_normal = require('./../../app/file/resize_normal');

var async = require('async');



module.exports = function(req, res) {
	try {
		// data : {"user" : {"user_id", "token"}, "name", "image_link", "extension"}
		var data = req.body;

		var user_id = data.user.user_id;
		var token = data.user.token;
		var create = data.create;

		var photo_id = data.photo_id;
		var name = data.name;
		var image_link = data.image_link;
		var extension = data.extension;

	} catch (err) {
		res.json({
			error_code: 201,
			msg: err.toString()
		}); // Input is invalid
		res.status(200).end();
	} finally {
		if (!validator.isAlphanumeric(user_id)) {
			res.json({
				error_code: 201,
				msg: 'user_id or photo_id is incorrect'
			}); //  Input is invalid
			res.status(200).end();
		} else {
			validate_token(user_id, token, function(valid) {
				if (!valid) {
					// VALIDATE IS NOT SUCCESS
					res.json({
						error_code: 100,
						msg: 'Authenticate is incorrect'
					}); //  Authenticate is incorrect
					res.status(200).end();

				} else {
					if (create == 1) { // CREATE PHOTO
						if (!image_link || !fs.existsSync(image_link)) {
							res.json({
								error_code: 201,
								msg: 'Image link is not exist'
							}); //  Input is invalid
							res.status(200).end();
						} else {

							var photo = new Photo;
							photo.name = name;
							var file_name = Math.floor(Math.random() * 1000000 + 1) +
								new Date().getTime() + '.' + extension;
							var new_location = '/img/full_size/photo/';

							// SAVE PHOTO
							fs.rename(image_link, './public' + new_location + file_name,
								function(err) {
									if (err) {
										res.json({
											error_code: 202,
											msg: err.toString()
										}); //  Image link is incorrect
										res.status(200).end();
									} else {
										async.waterfall([
											function(next) {
												photo.image_link = domain + new_location + file_name;
												photo.user_id = user_id;

												resize_small(photo.image_link, 'photo', function(image_link_small) {
													photo.image_link_small = image_link_small;
													resize_normal(photo.image_link, 'photo', function(image_link_normal) {
														photo.image_link_normal = image_link_normal;
														next(null);
													})
												})
											}
										], function(err) {
											photo.save(function(err) {
												if (err) {
													console.log(err);
													res.json({
														error_code: 402,
														msg: err.toString()
													}); //  Database cannot 
													res.status(200).end() //  save
												} else {
													process.nextTick(function() {
														res.json({
															error_code: 0,
															photo: photo
														});
														res.status(200).end();
													})
												}
											});
										});
									}
								})
						}
					} else { // Update photo
						Photo.findOne({
							_id: photo_id
						}, function(err, photo_exist) {
							if (err) {
								res.json({
									error_code: 402,
									msg: err.toString()
								});
								res.status(200).end();
							} else {
								if (photo_exist) {
									photo_exist.name = name;
									photo_exist.save(function(err) {
										if (err) {
											res.json({
												error_code: 402,
												msg: err.toString()
											});
											res.status(200).end();
										} else {
											process.nextTick(function() {
												res.json({
													error_code: 0,
													photo: photo_exist
												});
												res.status(200).end();
											})
										}
									})
								} else {
									res.json({
										error_code: 304,
										msg: 'photo is not exist'
									}); // photo is not exist
									res.status(200).end();
								}
							}
						})
					}
				}
			})
		}
	}
}