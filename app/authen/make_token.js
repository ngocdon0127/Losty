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

var bcrypt = require('bcrypt-nodejs');
var UserAuthen = require('./../../models/user_authens');
var Users_online = require('./../../models/users_online');

module.exports = function(user, res) {
    var user_id = user._id;
    var token = bcrypt.genSaltSync(20);

    Users_online.findOne({
        id: user_id
    }, function(err, user_online) {
        console.log(user_online);
        if (err) {
            console.log(err);
        } else {
            if (!user_online) {
                console.log('Make new user');
                var new_user_online = new Users_online();
                new_user_online.id = user_id;
                new_user_online.save(function(err) {
                    console.log(new_user_online)
                });
            }
        }
    })

    UserAuthen.findOne({
        user_id: user_id
    }, function(err, user_authen_exist) {
        if (err) {
            res.json({
                error_code: '401',
                msg: err.toString()
            });
            res.status(200).end();
        } else
        if (user_authen_exist) {
            // UPDATE TOKEN OF USER
            user_authen_exist.token = token;
            user_authen_exist.save(function(err) {
                if (err) {
                    console.error(err);
                    res.json({
                        error_code: 402,
                        msg: err.toString()
                    }); // database can't save
                    res.status(200).end();

                } else {
                    res.json({
                        error_code: 0,
                        user: {
                            email: user.email,
                            username: user.username,
                            id: user._id,
                            avatar: user.avatar,
                            city: user.city,
                            country: user.country,
                            fb_id: user.facebook.id,
                            tw_id: user.twitter.id,
                            type_account: user.type_account,
                            avatar_small: user.avatar_small
                        },
                        unread_msg: user.unread_msg,
                        token: token
                    });
                    res.status(200).end();
                }
            })
        } else {
            // CREATE NEW USER
            var user_authen = new UserAuthen();
            user_authen.user_id = user_id;
            user_authen.token = token;
            user_authen.save(function(err, user_authen) {
                if (err) {
                    res.json({
                        error_code: 402,
                        msg: err.toString()
                    }); // database can't save
                    res.status(200).end();

                } else {
                    res.json({
                        error_code: 0,
                        user: {
                            email: user.email,
                            username: user.username,
                            id: user._id,
                            avatar: user.avatar,
                            avatar_small: user.avatar_small,
                            city: user.city,
                            country: user.country,
                            fb_id: user.facebook.id,
                            tw_id: user.twitter.id,
                            type_account: user.type_account
                        },
                        unread_msg: user.unread_msg,
                        token: token
                    });
                    res.status(200).end();
                }
            })
        }
    })
}