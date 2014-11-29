var  validate_token					=	require('./../validate/validate_token');

var Message                          =   require('./../../models/messages');
var Users                            =   require('./../../models/users');
 
var _                                =   require('underscore');

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
          return user_chat._id == id_2;
        });
        console.log('id_2 index : ', id_2_find);
        if (typeof(id_2_find) == 'undefined'){
          Users.findOne({_id : id_2}, function(err, user_2){
            if (err){
              console.log(err);
            } else if (!user_2){
              console.log('User 2 is not exist');
            } else{
              console.log('Luu thong tin');
              user_exist.users_chat.push({id : id_2, username : user_2.username, avatar : user_2.avatar});
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

  chat.use(function(socket, next){

    var user_id = socket.request._query.user_id;
    var token   = socket.request._query.token;
    console.log('Have connect, user_id : ', user_id, ' , token : ', token);

    socket.emit('hello world', {});


    validate_token(user_id, token, function(valid){
      if (valid){

        user_sockets[user_id] = socket;
        list_user.push(user_id);  
        socket.user_id = user_id;

		user_sockets[user_id].emit('Online users', list_user);
        socket.broadcast.emit('One user online', user_id);
        console.log('Authenticate is success. Start to make socket');
        next();
      } else{
        next(new Error('Access denied !!!!'));
      }
    })
  });
 
  chat.on('connection', function(socket){


    socket.emit('hello client', {number : 123, object : {a:1, b:2}});
    socket.on('hello server', function(data){
      console.log(data);
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
    socket.on('readAllMessage', function(data){
      var user_send = data.user_send;
      var user_recei = data.user_recei;

      Message.find({$and : [{ user_send : user_recei}, {user_recei : user_send}, { status : 0}]}, 
    	function(err, messages_exist){
    		if (messages_exist){
    		  messages_exist.forEach(function(message_exist){
    			// message is read
    			message_exist.status = 1;
    			message_exist.save(function(err){});
    		  })
    		};
      });

      if (user_sockets[user_recei]){
    	user_sockets[user_recei].emit('readAllMessage', {user_send : user_send});
      }
    });

 // ============================= SEND MESSAGE====================================================

 	socket.on('Send message', function(data){
    console.log(data);
 	  var user_send  = data.user_send;
 	  var user_recei = data.user_recei;
 	  var content    = data.content;
 	  var status     = 0;
 	  var time       = convert_time_to_GMT((new Date).toJSON());

 	  // SAVE MESSAGE
 	  var message    = new Message;

	  message.user_send 	= user_send;
	  message.user_recei	= user_recei;
	  message.content  	= content;
	  message.status      = status;
	  message.time        = time;
	  message.save(function(err){
	  })	

  // add chater into users_chat of each people

    // into user_send
    add_users_chat(user_send, user_recei);

    // into user_recei
    add_users_chat(user_recei, user_send);
    

	  // ADD MESSAGE UNREAD OF USER_RECEI

 	  if (user_sockets[user_recei]){
 		Users.findOne({_id : user_send}, function(err, user_exist){
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
      socket.broadcast.emit('One user off', socket.user_id);
 	    delete user_sockets[socket.user_id];
      list_user.splice(list_user.indexOf(socket.user_id));
 	})
  })
}
