var User            = require('./../../models/users');
var make_token    = require('./../../app/authen/make_token');

var validator       = require('validator');
var bcrypt          = require('bcrypt-nodejs');

module.exports = function(req, res){
        try{
            var data = req.body;
            // data : {"user": { "email" : "...", "password" : "..." }}
            var email = data.user.email;
            var password = data.user.password;
        }
        catch(err){
            res.json({error_code : 201, msg : err.toString()});
            res.status(200).end();
        }
        finally{
            if (!validator.isEmail(email)){
            	res.json({error_code : 201, msg : 'Email is incorrect'});
            	res.status(200).end();
            } else if (!validator.isLength(password, 6, 25) ){
                res.json({error_code : 201, msg : 'Length of password is incorrect'});        
                res.status(200).end();
            } else{
                // VALIDATE IS SUCCESS
                User.findOne({email : email}, function(err, user_exist){
                    if (err) {
                        res.json({error_code : 401, msg : err.toString()});            
                        res.status(200).end();
                    } 
                    // VALIDATE EMAIL
                    else if (!user_exist) {
                        res.json({error_code : 301, msg : 'User is not exist'});           
                        res.status(200).end();
                    } else {
                        // VALIDATE PASSWORD
                        if (!user_exist.validPassword(password)){
                            res.json({error_code : 302, msg : 'Password is incorrect'});   
                            res.status(200).end();
                        } else if (!user_exist.active){
                            res.json({error_code : 600, msg : 'Account was deactive'});   
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