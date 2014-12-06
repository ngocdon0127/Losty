var  validate_token					=	require('./../validate/validate_token');

var Messages                          =   require('./../../models/messages');
var Users                            =   require('./../../models/users');
 
var _                                =   require('underscore');

// ========================================  FUNCTION =============================================

function convert_time_to_GMT(time){
  return new Date(new Date(time).toGMTString()).toJSON();
}

function add_users_chat(id_1, id_2){
  Users.findOne({_id : id_1}, function(err, user_exist){
    if (err){
      console.log(err);
    } else{
      if (!user_exist) {
        console.log('User is not exist :', user_exist);
      } else{
        users_chat = user_exist.users_chat;
        // console.log();
        var id_2_find = _.find(users_chat, function(user_chat){
          return user_chat.id == id_2;
        });
        if (typeof(id_2_find) == 'undefined'){
          Users.findOne({_id : id_2}, function(err, user_2){
            if (err){
              console.log(err);
            } else if (!user_2){
              console.log('User 2 is not exist');
            } else{
              user_exist.users_chat.push({id : id_2, username : user_2.username, avatar : user_2.avatar, avatar_small : user_2.avatar_small});
              user_exist.save(function(err){
                if (err){
                  console.log(err);
                }
              });    
            }
          })
        }
      }
    }
  })
}

module.exports = function(io){
  
  // list user online
  var list_user = [];
  // array socket of online user
  var user_sockets = {};

  var chat = io.of('chat');

  var user_id, token;

// ======================================== AUTHENTICATE =============================================

  chat.use(function(socket, next){

    user_id = socket.request._query.user_id;
    token   = socket.request._query.token;
    console.log('Have connect, user_id : ', user_id, ' , token : ', token);

    validate_token(user_id, token, function(valid){
      if (valid){

        user_sockets[user_id] = socket;
        list_user.push(user_id);  
        socket.user_id = user_id;
        console.log('AUTHENTICATE SUCCESS');
        next();
      } else{
        next(new Error('Access denied !!!!'));
      }
    })
  });
 
  chat.on('connection', function(socket){

    // SEND UNREAD_MSG
    Users.findOne({_id : user_id}, function(err, me){
      if(err){
        console.log(err);
      } else{
        socket.emit('unread_msg', {unread_msg : me.unread_msg});    
      }
    })

// ============================= TYPING ========================================================

    socket.on('Typing', function(data){
      var user_send = data.user_send;
      var user_recei = data.user_recei;
      if (user_sockets[user_recei]){
    	user_sockets[user_recei].emit('Typing', {user_send : user_send});
      };
    })

// ============================= STOP TYPING ===================================================

    socket.on('stopTyping', function(data){
      var user_send = data.user_send;
      var user_recei = data.user_recei;
      if (user_sockets[user_recei]){
    	user_sockets[user_recei].emit('stopTyping', {user_send : user_send});
      };
    })

// ============================= READ ALL MESSAGE================================================

    // user_send read all messages what user_recei sent to user_send
    socket.on('Read messages', function(data){

      var user_read = data.user_read;
      var user_sent = data.user_sent;

      console.log(user_read , ' read all messages from ', user_sent);

      // Danh dau tat ca tin nhan user_sent gui cho user_read la status = 1
      Messages.find({ user_send : user_sent, user_recei : user_read, status : 0}, 
    	function(err, messages_exist){
    		if (messages_exist){
    		  messages_exist.forEach(function(message_exist){
    			// message is read
    			message_exist.status = 1;
    			message_exist.save(function(err){});
    		  })
    		};
      });

      // Giam so luong tin nhan chua doc cua user_read di
      Users.findOne({_id : user_read}, function(err, user_exist){
        if (err){
          console.log(err);
        } else{
          if (user_exist && user_exist.unread_msg > 0){
            console.log('Da giam so luong tin nhan');
            user_exist.unread_msg -= 1;
            user_exist.save(function(err){});
            socket.emit('unread_msg', {unread_msg : user_exist.unread_msg});    

          }
        }
      })

      // Neu user_sent online thi gui su kien thong bao
      if (user_sockets[user_sent]){
    	user_sockets[user_sent].emit('Read messages', {user_read : user_read, user_sent : user_sent});
      }
    });

 // ============================= SEND MESSAGE====================================================

 	socket.on('Send message', function(data){
    // data : {user_send : 'user_id', user_recei : 'user_id', content : '..'
 	  var user_send  = data.user_send;
 	  var user_recei = data.user_recei;
 	  var content    = data.content;
 	  var status     = 0;
 	  var time       = convert_time_to_GMT((new Date).toJSON());

    console.log(user_send , ' sent a message to ', user_recei , ' : ', content);

    // ADD MESSAGE UNREAD OF USER_RECEI
    Messages.findOne({user_send : user_send, user_recei : user_recei, status : 0}, function(err, message_exist){
      console.log(message_exist);
      if (err){
        console.log(err.toString());
      } else {
        if (!message_exist){
          Users.findOne({_id : user_recei}, function(err, user_exist){
            console.log('Da them tin nhan chua doc');

            user_exist.unread_msg ++;
            user_exist.save(function(err){
              if (err)
                console.log(err.toString());
              console.log(user_exist);
            })
          })
        }
      }
    });


 	  // SAVE MESSAGE
 	  var message    = new Messages;
	  message.user_send 	= user_send;
	  message.user_recei	= user_recei;
	  message.content  	  = content;
	  message.status      = status;
	  message.time        = time;
	  message.save(function(err){
	  })	

    // add chater into users_chat of each people
    add_users_chat(user_send, user_recei);
    add_users_chat(user_recei, user_send);
    
    // User_recei online -> send msg, avatar, username user_send
 	  if (user_sockets[user_recei]){
   		Users.findOne({_id : user_send}, function(err, user_exist){

        Users.findOne({_id : user_recei}, function(err, user_recei_exist){
          user_sockets[user_recei].emit('unread_msg' , {unread_msg : user_recei_exist.unread_msg})
        })

   		  user_sockets[user_recei].emit('Send message', 
   			{	user_send : user_send, 
   				user_recei: user_recei,
   				content   : content,
   				status    : status,
   				time      : time,
   				username  : user_exist.username,
   				avatar    : user_exist.avatar
   			});
   		})
	  }
  })

 // ============================= DISCONNECT=======================================================

 	socket.on('disconnect', function(){
      console.log(socket.user_id + ' disconnect');
      socket.broadcast.emit('One user off', socket.user_id);
 	    delete user_sockets[socket.user_id];
      list_user.splice(list_user.indexOf(socket.user_id));
 	})
  })
}
