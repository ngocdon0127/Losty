var Item                =   require('./../../models/items');
var Category            =   require('./../../models/categores');

var validator           =   require('validator');

module.exports 			=	function(req, res){
	if (!req.rawBody){
		res.json({err : 'Request is incorrect'});
		res.status(200).end();
	} else{
		var data = JSON.parse(req.rawBody);

		// data : {"keyword", "type"}

		var keyword = data.keyword;
		var type    = data.type;

		if (!validator.isNumeric(type)){
			res.json({err : 'Validate is not success'});
			res.status(200);
		} else {
			Item.find({} , function(err, items){
				var result = [];

				items.forEach(function(item){

					var description = item.description.toLowerCase();
					var title       = item.title.toLowerCase();

					Category.findOne({_id : item.category_id}, function(err, category_exist){
						var category = category_exist.name.toLowerCase();

						if (item.type == type && 
						   (category.indexOf(keyword) != -1 || description.indexOf(keyword) != -1 
						   	|| title.indexOf(keyword) != -1 )){
							    result.push(item);
						};
					})
				})

				process.nextTick(function(){
					res.json({err : null, items : result});
					res.status(200).end();
				})
				
			})
		}

	}
}