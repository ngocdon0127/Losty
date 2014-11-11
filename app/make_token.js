// When user login/register, MAKE A TOKEN for user and RETURN USER INFOR AND TOKEN

/*
    RETURN
    {   “error_code” : 0,
                 "user": {
        "email": "cuongvc93@gmail.com",
        "username": "cuongvc93",
        "id": "544a175881b36c7c71f5333a",
        "avatar": "http://104.131.69.233:3000/img/avatar/1414154.jpeg"
      },
      "token": "$2a$20$PZ3Et7YQ4yNOjVIGSMQVm."
    }
*/

var bcrypt          =   require('bcrypt-nodejs');
var UserAuthen      =   require('./../models/user_authens');

module.exports      =   function(user, res){
    var user_id     =   user._id;
    var token       =   bcrypt.genSaltSync(20);

    UserAuthen.findOne({user_id : user_id}, function(err, user_authen_exist){
        if (user_authen_exist){
            // UPDATE TOKEN OF USER
            user_authen_exist.token = token;
            user_authen_exist.save(function(err){
                if (err){
                    console.error(err);
                    res.json({error_code : 402});             // database can't save
                    res.status(200).end();

                } else{
                    res.json(
                       {error_code : 0, 
                        user : {
                            email : user.email, username : user.username, 
                            id    : user._id  , avatar   : user.avatar
                        }, 
                        token : token});
                    res.status(200).end();                        
                }
            })
        } else{
            // CREATE NEW USER
            var user_authen = new UserAuthen();
            user_authen.user_id = user_id;
            user_authen.token   = token;
            user_authen.save(function(err, user_authen){
                if (err){
                    res.json({error_code : 402});             // database can't save
                    res.status(200).end();

                } else{
                    res.json(
                       {error_code : 0, 
                        user : {
                            email : user.email, username : user.username, 
                            id    : user._id  , avatar   : user.avatar
                        }, 
                        token : token});
                    res.status(200).end();                        
                }
            })
        }
    })
}