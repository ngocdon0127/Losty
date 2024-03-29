// ===========================  REGISTER LOCAL ACCOUNT  =================================

var domain = require('./../../config/default').domain_default;
var avatar_default = require('./../../config/default').avatar_default;
var validate_extension = require('./../../app/validate/validate_extension');
var validate_location = require('./../../app/validate/validate_location');
var reverseGeocode = require('./../../app/map/reverseGeocode');
var make_token = require('./../../app/authen/make_token');
var send_mail_register = require('./../../app/send_mail/send_mail_register');


var User = require('./../../models/users');


var formidable = require('formidable'),
  util = require('util'),
  fs = require('fs-extra');

var mime = require('mime'),
  validator = require('validator');

var resize_small = require('./../../app/file/resize_small');
var async = require('async');
var bcrypt = require('bcrypt-nodejs');

function validate_username(username) {
  var regex = /^([a-zA-Z])+([a-zA-Z0-9\_])/;
  return regex.test(username);
}

module.exports = function(req, res) {

  try {
    var data = req.body;

    // data : {"username" : "cuongvc93", "email" : "cuongvc93@gmail.com", "create" : "1"
    // "password" : "123456", "avatar_link" : "/tmp/i1b3r8bfdsbfk", "extension" : "jpeg", 
    // "location" : {"lat" : "", "lng" : ""}}
    var type_account = 1;
    var create = data.create;
    var username = data.username;
    var avatar_link = data.avatar_link;
    var email = data.email.toLowerCase();
    var password = data.password;
    var extension = data.extension;
    var location = data.location;
    // if (!validate_location(location))
    //   throw Error('Location is invalid');
  } catch (err) {
    res.json({
      error_code: 201,
      msg: err.toString()
    }); //  Input is invalid
    res.status(200).end();
  } finally {

    // ==== VALIDATE extension, user_id, item_id(if have), location, category_id ====
    if (!validate_username(username)) {
      res.json({
        error_code: 201,
        msg: 'Username is incorrect'
      });
      res.status(200).end();

    } else if (!validator.isEmail(email)) {
      res.json({
        error_code: 201,
        msg: 'Email is incorrect'
      });
      res.status(200).end();

    } else if (!validator.isLength(password, 6, 25)) {
      res.json({
        error_code: 201,
        msg: 'Length of password is incorrect'
      });
      res.status(200).end();
    } else {
      if (create == 1) { // Create new user
        if (avatar_link != '' && !validate_extension(avatar_link, extension)) {
          res.json({
            error_code: 203,
            msg: 'extension is incorrect'
          });
          res.status(200).end();
        } else {
          User.findOne({
            $or: [{
              username: username
            }, {
              email: email
            }]
          }, function(err, user_exist) {
            if (err) {
              console.log(err);
              res.json({
                error_code: 401,
                msg: err.toString()
              }); //  Databse cannot find
              res.status(200).end();
            } else if (user_exist) {
              res.json({
                error_code: 303,
                msg: 'Email is already exist'
              });
              res.status(200).end();
            } else {
              var user = new User;
              user.username = username;
              user.email = email;
              user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
              user.avatar = avatar_default;
              user.location = location;
              user.type_account = 1; // local account
              user.exist_acc[1] = 1;

              var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() + '.' + extension;
              var new_location = '/img/full_size/avatar/';
              async.waterfall([
                function(next) {
                  if (avatar_link != '') {
                    fs.rename(avatar_link, './public' + new_location + file_name, function(err) {
                      if (err) {
                        res.json({
                          error_code: 202,
                          msg: err.toString()
                        });
                        res.status(200).end();
                      } else {
                        user.avatar = domain + new_location + file_name;
                        resize_small(user.avatar, 'avatar', function(avatar_small) {
                          user.avatar_small = avatar_small;
                          console.log(avatar_small);
                          next(null);
                        })
                      }
                    })
                  } else {
                    next(null);
                  }
                }

              ], function(err) {
                process.nextTick(function() {
                  reverseGeocode(location, function(data) {
                    user.city = data.city;
                    user.country = data.country;

                    user.save(function(err) {
                      if (err) {
                        console.log(err);
                        res.json({
                          error_code: 402,
                          msg: err.toString()
                        }); // Database cannot save
                        res.status(200).end();
                      } else {
                        process.nextTick(function() {
                          send_mail_register(email, username);
                          make_token(user, res);
                        })
                      }
                    });
                  });
                });
              })
            }
          })
        }
      }
    }
  }
}