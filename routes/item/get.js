var validator	=	require('validator');
var Item 		= 	require('./../../models/items');


module.exports = function(req, res){
	var item_id  = req.params.id;
	if ( validator.isAlphanumeric(item_id) ){
		Item.findOne({_id : item_id}, function(err, item_exist){
			// if have err when find
			if (err){
				res.json({err : new Error(err)});
			} else{
				// if user is exist
				if (item_exist){
					res.json({err : null, item : item_exist});
					res.status(200).end();
				} else{
				// if user is not exist
					res.json({err : 'This item is not exist'});
					res.status(200).end();
				};
			}
				
		}) 
	} else{
		res.json({err : 'Id is incorrect'});
		res.status(200).end();
	}
	

}