
var   domain             = require('./../../config/default').domain_default;
var   avatar_default     = require('./../../config/default').avatar_default;
var   validate_extension = require('./../../app/validate_extension');
var   reverseGeocode     = require('./../../app/reverseGeocode');

var   formidable    = require('formidable'),
      util          = require('util'),
      fs            = require('fs-extra');

var   mime          = require('mime'),
	  validator     = require('validator');

var   bcrypt        = require('bcrypt-nodejs');
var   make_token    = require('./../../app/make_token');

var   User          = require('./../../models/users');

function validate_username(username){
    var regex = /^([a-zA-Z])+([a-zA-Z0-9\_])/;
    return regex.test(username);
}

function validateLocation(location){
    if (!location.lat || !location.lng)
        return 0;
    return 1;
}

module.exports = function(req, res) {

    try{
        var data = JSON.parse(req.rawBody);

        // data : {"username" : "cuongvc93", "email" : "cuongvc93@gmail.com", "create" : "1"
        // "password" : "123456", "avatar_link" : "/tmp/i1b3r8bfdsbfk", "extension" : "jpeg", 
        // "location" : {"lat" : "", "lng" : ""}}
        var create          = data.create;
        var avatar_link     = data.avatar_link;           
        var username        = data.username;
        var email           = data.email;
        var password        = data.password;
        var avatar_latest   = '';
        var extension       = data.extension;
        var location        = data.location;

    }
    catch(e){
        res.json({error_code : 201});                     //  Input is invalid
        res.status(200).end();

    }
    finally{

        // ==== VALIDATE extension, user_id, item_id(if have), location, category_id ====
        if ( !validate_username(username) || 
             !validator.isEmail(email) || !validateLocation(location)){
                        res.json({error_code : 201});       //   Input is invalid
                        res.status(200).end();
        }
        else {
            if(create == 1){    // Create new user
                if( !validate_extension(avatar_link, extension) ){

                        res.json({error_code : 203});
                        res.status(200).end();
                }  else{
                    User.findOne({$or : [{username : username}, {email : email}]}, function(err, user_exist){
                        if (err){
                            console.log(err);
                            res.json({error_code : 401});       //  Databse cannot find
                            res.status(200).end();
                        } 
                        else if (user_exist){
                            res.json({error_code : 303});       //  Email is really exist
                            res.status(200).end();
                        } else{

                            var user      = new User;
                            user.username = username;
                            user.email    = email;
                            user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                            user.avatar   = avatar_default;
                            user.location = location;


                            reverseGeocode(location, function(data){
                                console.log(data.city, '' , data.country);
                                user.city    = data.city;
                                user.country = data.country;

                                user.save(function(err){
                                    if (err){
                                        console.log(err);
                                        res.json({error_code : 402});// Database cannot save
                                        res.status(200).end();
                                    } else{
                                        process.nextTick(function(){
                                            make_token(user, res);
                                        })
                                    }
                                });
                                
                            });


                        }
                    })
                }
            }

        else {  // UPDATE PROFILE, CANNOT UPDATE IMAGE

            	User.findOne({$or : [{username : username}, {email : email}]}, function(err, user_exist){
            		if (err){
            			res.json({error_code : 401});
                        res.status(200).end();
            		} 
            		else if (user_exist){
            			res.json({error_code : 303});
            			res.status(200).end();
            		} else{
            			var user      = new User;
            			user.username = username;
            			user.email    = email;
            			user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                        user.location = location;

                        reverseGeocode(location, function(data){
                            user.city    = data.city;
                            user.country = data.country
                        });

                        var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() + '.' + extension;
                        var new_location = '/img/avatar/';

                        fs.rename(avatar_link, './public' + new_location + file_name, function(err) {
                        	if (err){
                        		res.json({error_code : 202});
                        		res.status(200).end();
                        	} else{
                        		user.avatar = domain + new_location + file_name;

                        		user.save(function(err){
                        			if (err){
                        				res.json({error_code : 402});
                                        res.status(200).end();
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


