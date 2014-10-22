var   bcrypt        = require('bcrypt-nodejs');
var UserAuthen  =   require('./../models/user_authens');

module.exports  =   function(user_id, res){
    token = bcrypt.genSaltSync(20);

    UserAuthen.findOne({user_id : user_id}, function(err, user_authen_exist){
        if (user_authen_exist){
            // update token of user
            user_authen_exist.token = token;
            user_authen_exist.save(function(err){
                if (err){
                    console.error(err);
                    res.json({err : new Error(err)});
                    res.status(200).end();

                } else{
                    res.json({err : null, token : token});
                    res.status(200).end();

                }
            })
        } else{
            // create new user
            var user_authen = new UserAuthen();
            user_authen.user_id = user_id;
            user_authen.token   = token;
            user_authen.save(function(err, user_authen){
                if (err){
                    console.error(err);
                    res.json({err : new Error(err)});
                    res.status(200).end();

                } else{
                    res.json({err : null, token : token});
                    res.status(200).end();

                }
            })
        }
    })
}