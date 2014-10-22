var   Category          = require('./../../models/categores');
var   validator         = require('validator');
var   validate_token    = require('./../../app/validate_token');
var   User              = require('./../../models/users');

module.exports = function(req, res) {
    // data : {"user" : {"user_id", "token"}, "category_id", name"}

    if (!validator.isJSON(req.rawBody)){
        res.json({err : 'Request is incorrect'})
        res.status(200).end();
    } else{
        var data = JSON.parse(req.rawBody);

        var user_id = data.user.user_id;
        var token   = data.user.token;
        var category_id = data.category_id;
        var name = data.name;
        if (!validator.isAlphanumeric(user_id) || (category_id != "" && !validator.isAlphanumeric(category_id))) {

            res.json({err : 'Validate fiels is not success'});
            res.status(200).end();
        } else{
            // authen user
            validate_token(user_id, token, function(valid){
                if (!valid){
                    res.json({err : 'User is incorrect'});
                    res.status(200).end();     
                } else{
                    User.findOne({_id : user_id}, function(err, user_exist){
                        if (user_exist.permission){ 
                            // USER IS ADMIN
                            if (category_id == ''){
                                // MAKE NEW CATEGORY
                                category = new Category();    
                                category.name = name;
                                category.save(function(err){
                                    if (err){
                                        console.err(err);
                                        res.json({err : new Error('Can not set category')});
                                        res.status(200).end();
                                    };
                                    process.nextTick(function(){
                                        res.json({err : null, category : category});
                                        res.status(200).end();
                                    })
                                })
                            } else{
                                // UPDATE CATEGORY
                                Category.findOne({_id : category_id}, function(err, category_exist){
                                    category_exist.name = name;
                                    category_exist.save(function(err){
                                        if (err){
                                            console.err(err);
                                            res.json({err : new Error('Can not set category')});
                                            res.status(200).end();
                                        };
                                        process.nextTick(function(){
                                            res.json({err : null, category : category_exist});
                                            res.status(200).end();
                                        })
                                    })
                                })
                            }                                            
                        } else{     // USER IS NOT ADMIN
                            res.json({err : "You don't have enough permission to create a category"});
                            res.status(200).end();
                        }
                    })
                }

            })
        }


    }

    
}