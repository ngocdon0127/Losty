var validator	=	require('validator');
var Item 		= 	require('./../../models/items');


module.exports = function(req, res){
	var item_id  = req.params.item_id;
	if ( validator.isAlphanumeric(item_id) ){
		Item.findOne({_id : item_id}, function(err, item_exist){
			// if have err when find
			if (err){
				res.json({error_code :401});
			} else{
				// if item is exist
				if (item_exist){
					res.json({error_code : 0, item : item_exist});
					res.status(200).end();
				} else{
				// if item is not exist
					res.json({error_code : 305});
					res.status(200).end();
				};
			}
				
		}) 
	} else{
		res.json({error_code : 201});
		res.status(200).end();
	}
	

}