var   domain        = require('./../../config/default').domain_default;

var   url           = require('url');
var   mime          = require('mime');
var   validator     = require('validator');
var   validate_extension = require('./../../app/validate_extension');

var   formidable    = require('formidable'),
      util          = require('util'),
      fs            = require('fs');

var   validate_token= require('./../../app/validate_token');

var   bcrypt        = require('bcrypt-nodejs');

var   Item          = require('./../../models/items');
var   User          = require('./../../models/users');
var   Categores     = require('./../../models/categores');


function validatorLocation(location_obj){

    if (!location_obj.lat || !location_obj.lng)
        return 0;
    return 1;
}

module.exports = function(req, res) {

    try{

        // data : {user : {user_id, token}, category_id, create, item_id, image_link, extension, 
        /// title, description, type, location, date_lost, reward, report}

        // REMEMBER TO CREATE TIME_POST

        var data = JSON.parse(req.rawBody);
        
        var token       = data.user.token;
        var user_id     = data.user.user_id;
        var create      = data.create;

        var item_id     = data.item_id;
        var category_id = data.category_id;
        var category;
        Categores.findOne({_id : category_id}, function(err, category_exist){
            if (err){
                res.json({error_code : 307});
                res.status(200);
                return 1;
            }
            else if(category_exist){
                category = category_exist.name;    
            } else{
                res.json({error_code : 307});
                res.status(200);
                return 1;

            }
        })  

        var title       = data.title;
        var description = data.description;
        var type        = data.type;
        var image_link  = data.image_link;
        var extension   = data.extension;
        var location    = data.location;
        var date_lost   = data.date_lost;
        var reward      = data.reward;
        var report      = data.report;

    }
    catch(e){
        res.json({error_code : 201});               // Input is invalid
        res.status(200).end();
    }
    finally{
            // ==== VALIDATE extension, user_id, item_id(if have), location, category_id ====
            if (    !validator.isAlphanumeric(user_id) || 
                    (item_id != "" && !validator.isAlphanumeric(item_id) ) ||     
                    !validator.isAlphanumeric(category_id) || 
                    !validatorLocation(location)){

                        res.json({error_code : 201});       // Input is invalid
                        res.status(200).end();
            } 
            else if(create == 1 && (image_link == "" || !fs.existsSync(image_link)) ){
                res.json({error_code : 202});               // image link is not exist
                res.status(200).end();
            }
            else if(create == 1 &&  (image_link == "" || !validate_extension(image_link, extension))) {
                res.json({error_code : 203});               // extension of file is incorrect
                res.status(200).end();
                return 1;
            }
            else{
                // =================== VALIDATE ALL IS SUCCESS ==================================
                // make file_name by RANDOM NUMBER + TIME + EXTENSION
                validate_token(user_id, token, function(valid){
                    if (!valid){
                        res.json({error_code : 100});       // Authenticate is incorrect
                        res.status(200).end();
                    } else {
                        if (create == 1){         // ======== MAKE NEW ITEM ================
                            var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() 
                                + '.' + extension;

                            var new_location = '/img/item/';
                            // SAVE IMAGE
                            fs.rename(image_link, './public' + new_location + file_name, function(err) {
                                if (err) {
                                    res.json({error_code : 306});       // Image is not exist
                                    res.status(200).end();
                                } else {
                                        var item            = new Item();
                                        item.user_id        = user_id;
                                        item.category_id    = category_id;
                                        item.category       = category;
                                        item.title          = title;
                                        item.description    = description;
                                        item.type           = type;
                                        item.location       = location;
                                        item.reward         = reward;
                                        item.report         = report;
                                        item.image_link     = domain + new_location + file_name;
                                        item.date_lost      = date_lost;
                                        item.time_post      = (new Date).toJSON();

                                        // SAVE AVATAR, USERNAME AND CITY, COUNTRY USER
                                        User.findOne({_id : user_id}, function(err, user_exits){
                                            if (err){
                                                res.json({error_code : 401});   // database cannot find
                                                res.status(200).end();
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
                                                            res.json({error_code : 402});
                                                            res.status(200).end();
                                                        }
                                                        else {
                                                            process.nextTick(function(){
                                                                // SAVE ITEM IN INFOR USER
                                                                user_exits.Item.push(item._id);
                                                                user_exits.save(function(err){
                                                                    if (err){
                                                                        res.json({error_code : 402});
                                                                        res.status(200).end();
                                                                    }
                                                                })
                                                                res.json({error_code : 0, item : item});
                                                                res.status(200).end();   
                                                            })   
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                }
                            })
                        } else{         // UPDATE ITEM
                            console.log('Update item');
                            Item.findOne({_id : item_id}, function(err, item_exist){
                                        if (item_exist && item_exist.user_id == user_id){

                                            // UPDATE INFOR
                                            // cannot update image_link
                                            item_exist.user_id        = user_id;
                                            item_exist.category_id    = category_id;
                                            item.category       = category;
                                            item_exist.title          = title;
                                            item_exist.description    = description;
                                            item_exist.type           = type;
                                            item_exist.location       = location;
                                            item_exist.reward         = reward;
                                            item_exist.report         = report;
                                            item_exist.date_lost      = date_lost;
                                            item_exist.post_time      = (new Date).toJSON();
                                            // USER INFO IS NOT UPDATE BECAUSE USER IS NOT CHANGE

                                            item_exist.save(function(err){
                                                if (err){
                                                    res.json({error_code : 402});       // database
                                                    res.status(200).end();              // cannot save
                                                }
                                                else {
                                                    process.nextTick(function(){
                                                        res.json({error_code : 0, item : item_exist});
                                                        res.status(200).end();   
                                                    })   
                                                }
                                            })
                                        } else{
                                            res.json({error_code: 305});                // Item is not exist
                                            res.status(200).end();
                                        }
                            })
                        }
                    }
                })
            }
    }
}


