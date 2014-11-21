// ===========================  REGISTER LOCAL ACCOUNT  =================================

var   domain             = require('./../../config/default').domain_default;
var   avatar_default     = require('./../../config/default').avatar_default;
var   validate_extension = require('./../../app/validate/validate_extension');
var   validate_location  = require('./../../app/validate/validate_location');
var   reverseGeocode     = require('./../../app/map/reverseGeocode');
var   make_token         = require('./../../app/authen/make_token');

var   User               = require('./../../models/users');


var   formidable         = require('formidable'),
      util               = require('util'),
      fs                 = require('fs-extra');

var   mime               = require('mime'),
	    validator          = require('validator');

var   bcrypt             = require('bcrypt-nodejs');
 
function validate_username(username){
  var regex = /^([a-zA-Z])+([a-zA-Z0-9\_])/;
  return regex.test(username);
}

module.exports = function(req, res) {

  try{
    var data = req.body;

    // data : {"username" : "cuongvc93", "email" : "cuongvc93@gmail.com", "create" : "1"
    // "password" : "123456", "avatar_link" : "/tmp/i1b3r8bfdsbfk", "extension" : "jpeg", 
    // "location" : {"lat" : "", "lng" : ""}}
    var type_account    = 1;
    var create          = data.create;
    var username        = data.username;
    var avatar_link     = data.avatar_link;           
    var email           = data.email;
    var password        = data.password;
    var extension       = data.extension;
    var location        = data.location;
    if (!validate_location(location))
      throw Error('Location is invalid');
  }
  catch(err){
    res.json({error_code : 201, msg : err.toString()});                     //  Input is invalid
    res.status(200).end();
  }
  finally{

    // ==== VALIDATE extension, user_id, item_id(if have), location, category_id ====
    if ( !validate_username(username) ||  !validator.isEmail(email)){
      res.json({error_code : 201, msg : 'Username or Email is incorrect'});       //   Input is invalid
      res.status(200).end();
    }
    else {
      if(create == 1){      // Create new user
        if( !validate_extension(avatar_link, extension) ){
          res.json({error_code : 203, msg : 'extension is incorrect'});
          res.status(200).end();
        }  else{
          User.findOne({$or : [{username : username}, {email : email}]}, function(err, user_exist){
            if (err){
              console.log(err);
                res.json({error_code : 401, msg : err.toString()});       //  Databse cannot find
                res.status(200).end();
              } 
            else if (user_exist){
              res.json({error_code : 303, msg : 'Email is really exist'});       //  Email is really exist
                res.status(200).end();
              } else{
                var user      = new User;
                user.username = username;
                user.email    = email;
                user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
                user.avatar   = avatar_default;
                user.location = location;
                user.type_account = 1; // local account

                reverseGeocode(location, function(data){
                  user.city    = data.city;
                  user.country = data.country;

                  process.nextTick(function(){
                    user.save(function(err){
                      if (err){
                        console.log(err);
                        res.json({error_code : 402, msg : err.toString()});// Database cannot save
                        res.status(200).end();
                      } else{
                        process.nextTick(function(){
                          make_token(user, res);
                        })
                      }
                    });                                
                  });
                });
              }
          })
        }
      }
      else {                // UPDATE PROFILE, CANNOT UPDATE IMAGE
        User.findOne({$or : [{username : username}, {email : email}]}, function(err, user_exist){
          if (err){
            res.json({error_code : 401, msg : err.toString()});
            res.status(200).end();
          } 
          else if (user_exist){
            res.json({error_code : 303, msg : 'User is really exist'});
            res.status(200).end();
          } else{
            var user      = new User;
            user.username = username;
            user.email    = email;
            user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
            user.location = location;
            user.type_account = 1; // local account

            reverseGeocode(location, function(data){
              user.city    = data.city;
              user.country = data.country
            });

            var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() + '.' + extension;
            var new_location = '/img/avatar/';

            fs.rename(avatar_link, './public' + new_location + file_name, function(err) {
              if (err){
                res.json({error_code : 202, msg : err.toString()});
                res.status(200).end();
              } else{
                user.avatar = domain + new_location + file_name;

                user.save(function(err){
                  if (err){
                    res.json({error_code : 402, msg : err.toString()});
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


