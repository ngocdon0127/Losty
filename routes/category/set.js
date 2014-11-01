var   Category          = require('./../../models/categores');
var   validator         = require('validator');
var   validate_token    = require('./../../app/validate_token');
var   User              = require('./../../models/users');

module.exports = function(req, res) {
    // data : {"user" : {"user_id", "token"}, "category_id", name"}

    try{
        var data = JSON.parse(req.rawBody);

        var user_id = data.user.user_id;
        var token   = data.user.token;
        var category_id = data.category_id;
        var name = data.name;
        var create = data.create;

    }
    catch(e){
        res.json({error_code : 201});               // Input is invalid
        res.status(200).end();

    }
    finally{
        if (!validator.isAlphanumeric(user_id) || (create == 0 && 
            !validator.isAlphanumeric(category_id))) {
                res.json({error_code : 201});               // Input is invalid
                res.status(200).end();
        } else{
            // authen user
            validate_token(user_id, token, function(valid){
                if (!valid){
                    res.json({error_code : 100});           // Authenticate is incorrect
                    res.status(200).end();     
                } else{
                    User.findOne({_id : user_id}, function(err, user_exist){
                        if (err){
                            res.json({error_code : 401});   //  Database cannot find
                            res.status(200).end();
                        } else
                        if (user_exist.permission){ 
                            // USER IS ADMIN
                            if (create == 1){
                                // MAKE NEW CATEGORY
                                category = new Category();    
                                category.name = name;
                                category.save(function(err){
                                    if (err){
                                        res.json({error_code : 402});
                                        res.status(200).end();
                                    };
                                    process.nextTick(function(){
                                        res.json({error_code : 0, category : category});
                                        res.status(200).end();
                                    })
                                })
                            } else{
                                // UPDATE CATEGORY
                                Category.findOne({_id : category_id}, function(err, category_exist){
                                    if (err){
                                        res.json({error_code : 401});
                                        res.status(200).end();
                                    } else{
                                        if (category_exist){
                                            category_exist.name = name;
                                            category_exist.save(function(err){
                                                if (err){
                                                    res.json({error_code : 402});
                                                    res.status(200).end();
                                                };
                                                process.nextTick(function(){
                                                    res.json({error_code : 0, category : category_exist});
                                                    res.status(200).end();
                                                })
                                            })
                                        } else{
                                            res.json({error_code : 307});       // Category is not exist
                                            res.status(200).end();
                                        }
                                    }
                                })
                            }                                            
                        } else{     // USER IS NOT ADMIN
                            res.json({error_code : 500});       // Not have enough permission
                            res.status(200).end();
                        }
                    })
                }
            })
        }
    }
}