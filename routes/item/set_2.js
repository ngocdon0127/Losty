var   domain             = require('./../../config/default').domain_default;

var   resize             = require('./../../app/file/resize');
var   url                = require('url');
var   mime               = require('mime');
var   validator          = require('validator');
var   validate_extension = require('./../../app/validate/validate_extension');
var   validate_location  = require('./../../app/validate/validate_location');

var   formidable         = require('formidable'),
      util               = require('util'),
      fs                 = require('fs');

var   validate_token     = require('./../../app/validate/validate_token');

var   bcrypt             = require('bcrypt-nodejs');
var   async              = require('async');
var   waterfall          = require('waterfall');

var   Item               = require('./../../models/items');
var   User               = require('./../../models/users');
var   Categores          = require('./../../models/categores');
var   resize             = require('./../../app/file/resize');
var   resize_normal      = require('./../../app/file/resize_normal');


var   moment             = require('moment-timezone');

function check_category_exist(category_id, cb){
	Categores.findOne({_id : category_id}, function(err, category_exist){
    if (err){
    	cb(0);
    }
    else if(category_exist){
      cb(1, category_exist.name);    
    } else{
      cb(0);
    }
	})
}	

function convert_another_zone(time, city){
	var time = moment(time).tz("America/Los_Angeles").format();
	return time;
}

function convert_time_to_GMT(time){
	return new Date(new Date(time).toGMTString()).toJSON();
}

module.exports = function(req, res) {

    try{
      // data : {user : {user_id, token}, category_id, create, item_id, image_link, 
      // image_link_small, extension,  title, description, type, location, 
      //date_lost, reward, report, img_from_photo}

      // REMEMBER TO CREATE TIME_POST
      var data        = req.body;
        
      var token       = data.user.token;
      var user_id     = data.user.user_id;
      var create      = data.create;
      var img_from_photo = data.img_from_photo;

      var item_id     = data.item_id;
      var category_id = data.category_id;
      var category;

      check_category_exist(category_id, function(exist, category_name){
      	if (exist){
      		category = category_name;
      	} else{
      		res.json({error_code : 201, msg : 'Categores is not exist'});
      		res.status(200).end();
      	}
      })

      var title       = data.title;
      var description = data.description;
      var type        = data.type;
      var image_link  = data.image_link;
      var image_link_small = data.image_link_small;
      var extension   = data.extension;
      var location    = data.location;
      var date_lost   = data.date_lost;
      var reward      = data.reward;
      var report      = data.report;

      var image_link_small_server = '';
      var image_link_server = '';
      var image_link_normal_server = '';

    }
    catch(err){
      res.json({error_code : 201, msg : err.toString()});             
      res.status(200).end();
    }
    finally{
    	if (create){
	    	waterfall([

	    		// validate fields
	    		function(next){
			      if ( !validator.isAlphanumeric(user_id) || 
			          (item_id != "" && !validator.isAlphanumeric(item_id) ) ||     
			           !validator.isAlphanumeric(category_id) ){
			        res.json({error_code : 201, 
			                  msg : 'format of user_id or item_id or category_id or location is incorrect'});       
			        res.status(200).end();
			        return 1;
			      }  else{
			      	next(null);
			      }
	    		},

	    		// validate image_link
	    		function(next){
	    			if(create == 1 && (image_link != "" && !fs.existsSync(image_link)) ){
			        res.json({error_code : 202, msg : 'image link is not exist'});            
			        res.status(200).end();
			        return 1;
			      } else{
			      	next(null);
			      }
	    		},

	    		// validate token
	    		function(next){
	    			validate_token(user_id, token, function(valid){
	    				if (!valid){
		            res.json({error_code : 100, msg : 'Authenticate is incorrect'});       // Authenticate is incorrect
		            res.status(200).end();
		            return 1;
	    				} else{
	    					next(null);
	    				}
	    			})
	    		}, 

	    		// make image_link_server , image_link_small_server, image_link_normal_server
	    		function(next){
	    			if (img_from_photo){
	    				image_link_server = image_link;
	    				image_link_small_server = image_link_small;
	    			} else{
	            fs.rename(image_link, './public' + new_location + file_name, function(err) {
	              if (err) {
	                res.json({error_code : 306, msg : err.toString()});       // Image is not exist
	                res.status(200).end();
	                return 1;
								} else{
	                image_link_server  = domain + new_location + file_name;
	                resize(image_link_server, function(image_link_small){
	                  image_link_small_server = image_link_small;
					          resize_normal(image_link_server, function(image_link_normal){
					            image_link_normal_server = image_link_normal;
					            next(null);
					          });
	                 })
								}
	            })
	    			}
	    		},

	    		// make item
	    		function(next){
	          var item            = new Item();    			
	          item.category_id    = category_id;
	          item.category       = category;
	          item.title          = title;
	          item.description    = description;
	          item.type           = type;
	          item.location       = location;
	          item.reward         = reward;
	          item.report         = report;
	          item.image_link     = image_link_server;
	          item.item_link_small = image_link_small_server;
	          item.item_link_normal = image_link_normal_server;
	          item.date_lost      = convert_time_to_GMT(date_lost);
	          item.time_post      = convert_time_to_GMT((new Date).toJSON());

	          next(null);
	    		},

	    		// add user infor 
	    		function(next){
	          User.findOne({_id : user_id}, function(err, user_exits){
	            if (err){
	             	res.json({error_code : 401, msg : err.toString()});
	              res.status(200).end();
	              return 1;
	            } else{
	              if (user_exits){                                
	                item.user.id       = user_exits._id;
	                item.user.avatar   = user_exits.avatar;
	                item.user.avatar_small = user_exits.avatar_small;
	                item.user.username = user_exits.username;
	                item.user.city     = user_exits.city;
	               	item.user.country  = user_exits.country;
	               	next(null);
	                
	              } else{
	                res.json({error_code : 308, msg : 'User is not exist'});
	                res.status(200).end();
	                return 1;
	              }
	            }
	        	})
	    		}
	    	], function(err){
	    		item.save(function(err){
	    			if (err){
	    				res.json({error_code : 402, msg : err.toString()});
	    				res.status(200).end();
	    			} else{
              res.json({error_code : 0, msg : item});
              res.status(200).end();
	    			}
	    		})
	    	});
			} else{
				// UPDATE ITEM
			}
    }
}


