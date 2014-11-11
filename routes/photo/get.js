var validator	=	require('validator');
var Item 		= 	require('./../../models/photos');


module.exports = function(req, res){
	var photo_id  = req.params.photo_id;
	if ( validator.isAlphanumeric(photo_id) ){
		Item.findOne({_id : photo_id}, function(err, photo_exist){
			// if have err when find
			if (err){
				res.json({error_code : 201, msg : err.toString()});	//	Database cannot find
				res.status(200).end();
			} else{
				// if photo is exist
				if (photo_exist){
					res.json({error_code : 0, photo : photo_exist});
					res.status(200).end();
				} else{
				// if photo is not exist
					res.json({error_code : 304, msg : 'Photo is not exist'}); // Photo is not exist
					res.status(200).end();
				};
			}
				
		}) 
	} else{
		res.json({error_code : 201, msg : 'Photo_id is incorrect'});			//	Input is invalid
		res.status(200).end();
	}
}