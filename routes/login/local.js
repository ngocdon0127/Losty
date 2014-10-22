var User            = require('./../../models/users');
var   make_token    = require('./../../app/make_token');

var validator       = require('validator');
var bcrypt          = require('bcrypt-nodejs');

module.exports = function(req, res){
    if (!req.rawBody){
        res.json({err : 'Request is incorrect'});
        res.status(200).end();
    } else{
        var data = JSON.parse(req.rawBody);
        // data : {"user": { "email" : "...", "password" : "..." }}

        if (!validator.isEmail(data.user.email) || !validator.isLength(data.user.password, 6, 25)){
            res.json({err : 'Validate fiels is not success'});
            res.status(200).end();
        } else{
            // VALIDATE IS SUCCESS
            User.findOne({email : data.user.email}, function(err, user_exist){
                if (err) {
                    console.error(err);
                    res.json({err : new Error(err)});
                    res.status(200).end();
                }

                if (!user_exist) {
                    res.json('email is incorrect');         //  email is incorrect
                } else {
                    if (!user_exist.validPassword(data.user.password)){
                        res.json({err : new Error('password is incorrect')});  //  password is incorrect
                        res.status(200).end();
                    } else{
                        // login success, make token and res.json token
                        make_token(user_exist._id, res);
                    }
                }
            })

            
        }

    }

    
}