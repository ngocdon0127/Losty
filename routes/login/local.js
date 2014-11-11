var User            = require('./../../models/users');
var   make_token    = require('./../../app/make_token');

var validator       = require('validator');
var bcrypt          = require('bcrypt-nodejs');

module.exports = function(req, res){
        try{
            var data = JSON.parse(req.rawBody);
            // data : {"user": { "email" : "...", "password" : "..." }}
            var email = data.user.email;
            var password = data.user.password;
        }
        catch(e){
            res.json({error_code : 201});
            res.status(200).end();
        }
        finally{
            if (!validator.isEmail(email) || !validator.isLength(password, 6, 25) ||
                !validator.isAlphanumeric(password)){
                res.json({error_code : 201});                     // input is invalid
                res.status(200).end();
            } else{
                // VALIDATE IS SUCCESS
                User.findOne({email : email}, function(err, user_exist){
                    if (err) {
                        res.json({error_code : 401});             //  database cannot find
                        res.status(200).end();
                    } 
                    // VALIDATE EMAIL
                    else if (!user_exist) {
                        res.json({error_code : 301});              //  email is incorrect
                        res.status(200).end();
                    } else {
                        // VALIDATE PASSWORD
                        if (!user_exist.validPassword(password)){
                            res.json({error_code : 302});         //  password is incorrect
                            res.status(200).end();
                        } else{
                            // login success, make token and res.json token
                            make_token(user_exist, res);
                        }
                    }
                })          
            }
        }
}