var domain          = require('./../../config/domain').domain;

var   url           = require('url');
var   mime          = require('mime');
var   validator     = require('validator');

var   formidable    = require('formidable'),
      util          = require('util'),
      fs            = require('fs-extra');

var   validate_token= require('./../../app/validate_token');

var   bcrypt        = require('bcrypt-nodejs');

var   Item          = require('./../../models/items');
var   User          = require('./../../models/users');

var   token         = '';
var   user_id       = '';
var   category      = '';
var   image         = '';
var   title         = '';
var   description   = '';
var   type          = '';
var   location      = {};
var   date          = '';

function validatorLocation(location_obj){

    // CHUA XET
    return 1;
}

module.exports = function(req, res, next) {

    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        item_id     = fields.item_id;
        token       = fields.token;
        user_id     = fields.user_id;
        category_id = fields.category_id;
        title       = fields.title;
        description = fields.description;
        type        = fields.type;
        location    = fields.location;
        reward      = fields.reward;
        report      = fields.report;
        date        = fields.date;      
    });


    form.on('end', function(fields, files) {
        if (!this.openedFiles[0]){
            res.json({err: "Haven't image of item"});
            res.status(200).end();
        } else{
            var temp_path = this.openedFiles[0].path;

            var extension = mime.extension(mime.lookup(this.openedFiles[0].name)).toLowerCase();

            // ==== VALIDATE extension, user_id, item_id(if have), location, category_id ====
            console.log(validator.isAlphanumeric(user_id));
            console.log(validator.isAlphanumeric(category_id));

            if (    !validator.isAlphanumeric(user_id) || 
                    (item_id != "" && !validator.isAlphanumeric(item_id) ) ||     
                    !validator.isAlphanumeric(category_id) || 
                    !validatorLocation(location)){

                        res.json({err : 'Validate is not success'});
                        res.status(200).end();
            }
            else if( extension != 'png'  && extension != 'jpg' && extension != 'gif' && 
                     extension != 'jpeg' && extension != 'bmp'){

                        res.json({err : 'Image is incorrect'});
                        res.status(200).end();
            } 
            else {
                // =================== VALIDATE ALL IS SUCCESS ==================================
                // make file_name by RANDOM NUMBER + TIME + EXTENSION
                var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() + '.' + extension;
                validate_token(user_id, token, function(valid){
                    if (!valid){
                        res.json({err : 'user is fake'});
                        res.status(200).end();
                    } else{
                        var new_location = '/img/item/';

                        // ======== MAKE NEW ITEM ================
                        // SAVE IMAGE
                        fs.copy(temp_path, './public' + new_location + file_name, function(err) {
                            if (err) {
                                console.error(err);
                                res.json({err : new Error(err)});
                                res.status(200).end();
                            } else {
                                if (item_id === ''){        // MAKE NEW ITEM

                                    var item            = new Item();
                                    item.user_id        = user_id;
                                    item.category       = category;
                                    item.title          = title;
                                    item.description    = description;
                                    item.type           = type;
                                    item.location       = location;
                                    item.reward         = reward;
                                    item.report         = report;
                                    item.image          = domain + new_location + file_name;
                                    item.date           = date;
                                    item.time_post      = new Date;

                                    // SAVE AVATAR, USERNAME AND CITY, COUNTRY USER
                                    User.findOne({_id : user_id}, function(err, user_exits){
                                        if (err){
                                            console.error(err);
                                        } else{
                                            if (user_exits){

                                                // SAVE ITEM
                                                item.user.avatar   = user_exits.avatar;
                                                item.user.username = user_exits.username;
                                                item.user.city     = user_exits.city;
                                                item.user.country  = user_exits.country;
                                                                    // SAVE ITEM
                                                item.save(function(err){
                                                    if (err){
                                                        console.error(err);
                                                        res.json({err : new Error(err)});
                                                        res.status(200).end();
                                                    }
                                                    else {
                                                        process.nextTick(function(){
                                                            // SAVE ITEM IN INFOR USER
                                                            user_exits.Item.push(item._id);
                                                            user_exits.save(function(err){
                                                                if (err){
                                                                    console.err;
                                                                }
                                                            })
                                                            res.json({err : null, item : item});
                                                            res.status(200).end();   
                                                        })   
                                                    }
                                                })
                                            }
                                        }
                                    })
                                } else{                     // UPDATE ITEM

                                    Item.findOne({_id : item_id}, function(err, item_exist){
                                        if (item_exist && item_exist.user_id == user_id){

                                            // REMOVE IMAGE OF OLD ITEM

                                            fs.unlink(  './public' + url.parse(item_exist.image).path , function(err){
                                                if (err){
                                                    console.error(err);
                                                }
                                            })

                                            // UPDATE INFOR
                                            item_exist.user_id        = user_id;
                                            item_exist.category       = category;
                                            item_exist.title          = title;
                                            item_exist.description    = description;
                                            item_exist.type           = type;
                                            item_exist.location       = location;
                                            item_exist.reward         = reward;
                                            item_exist.report         = report;
                                            item_exist.image          = domain + new_location + file_name;
                                            item_exist.date           = date;
                                            item_exist.post_time      = (new Date).toJSON();
                                            // USER INFO IS NOT UPDATE BECAUSE USER IS NOT CHANGE

                                            item_exist.save(function(err){
                                                if (err){
                                                    console.error(err);
                                                    res.json({err : new Error(err)});
                                                    res.status(200).end();
                                                }
                                                else {
                                                    process.nextTick(function(){
                                                        res.json({err : null, item : item_exist});
                                                        res.status(200).end();   
                                                    })   
                                                }
                                            })
                                        } else{
                                            res.json({err: 'Item is not exits or user is not have this item'})
                                            res.status(200).end();
                                        }
                                    })
                                }
                            }
                        })
                     }
                });
            }
        }        
    });
} 