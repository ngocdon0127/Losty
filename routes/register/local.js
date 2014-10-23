var   domain        = require('./../../config/default').domain_default;
var   avatar_default= require('./../../config/default').avatar_default;

var   formidable    = require('formidable'),
      util          = require('util'),
      fs            = require('fs-extra');

var   mime          = require('mime'),
	  validator     = require('validator');

var   bcrypt        = require('bcrypt-nodejs');
var   make_token    = require('./../../app/make_token');

var   User          = require('./../../models/users');

module.exports = function(req, res) {

	if (!req.rawBody){
		res.json({err : 'Request is incorrect'});
		res.status(200).end();
	} else{

		var data = JSON.parse(req.rawBody);

		// data : {"username" : "cuongvc93", "email" : "cuongvc93@gmail.com", 
		// "password" : "123456", "avatar_link" : "/tmp/i1b3r8bfdsbfk", "extension" : "jpeg"}

		var avatar_link 	= data.avatar_link;
	    var username 		= data.username;
	    var email    		= data.email;
	    var password 		= data.password;
	    var extension   	= data.extension;
	    var avatar_latest	= '';

        // ==== VALIDATE extension, user_id, item_id(if have), location, category_id ====
        if (    !validator.isAlphanumeric(username) || 
                    !validator.isEmail(email)){
                        res.json({err : 'Validate is not success'});
                        res.status(200).end();
        }
        else {
            if(!avatar_link || !fs.existsSync(avatar_link)){

                User.findOne({$or : [{username : username}, {email : email}]}, function(err, user_exist){
                    if (err){
                        console.log(err);
                        res.json({err : new Error(err)});
                    } 
                    else if (user_exist){
                        res.json({err : 'User is exist'});
                        res.status(200).end();
                    } else{

                        var user      = new User;
                        user.username = username;
                        user.email    = email;
                        user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                        user.avatar   = avatar_default;
                        user.save(function(err){
                            if (err){
                                console.log(err);
                            } else{
                                process.nextTick(function(){
                                    make_token(user, res);
                                })
                            }
                        });
                    }
                })
            }

        else if( extension != 'png'  && extension != 'jpg' && extension != 'gif' && 
                     extension != 'jpeg' && extension != 'bmp' && 
                     extension == mime.extension(mime.lookup(image_link)) ){

                        res.json({err : 'Image is incorrect'});
                        res.status(200).end();
        } 
        else {
            	User.findOne({$or : [{username : username}, {email : email}]}, function(err, user_exist){
            		if (err){
            			console.log(err);
            			res.json({err : new Error(err)});
            		} 
            		else if (user_exist){
            			res.json({err : 'User is exist'});
            			res.status(200).end();
            		} else{
            			var user      = new User;
            			user.username = username;
            			user.email    = email;
            			user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

                        var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() + '.' + extension;
                        var new_location = '/img/avatar/';

                        fs.rename(avatar_link, './public' + new_location + file_name, function(err) {
                        	if (err){
                        		cosole.log(err);
                        		res.json({err : new Error(err)});
                        		res.status(200);
                        	} else{
                        		user.avatar = domain + new_location + file_name;

                        		user.save(function(err){
                        			if (err){
                        				console.log(err);
                        			} else{
                        				process.nextTick(function(){
                                            make_token(user, res);
                        				})
                        			}

                        		})
                        	}
                        })
            		}
            	})   	
		}
	   }
    }
}


