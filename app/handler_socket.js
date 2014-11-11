var  validate_token			=	require('./validate_token');

var Message                 =   require('./../models/messages');
var User                    =   require('./../models/users');

module.exports = function(io){

    var listUser = {};

    // array socket of online user
    var online_user = {};

    var chat = io.of('chat');

    chat.use(function(socket, next){
    	console.log(socket.request._query);
        var user_id = socket.request._query.user_id;
        var token   = socket.request._query.token;
        console.log(user_id , ' ' , token);
        validate_token(user_id, token, function(valid){
        	if (valid){
        		online_user[user_id] = socket;
        		socket.id = user_id;
        		next();
        	} else{
        		next(new Error('Access denied !!!!'));
        	}
        })
    });

    chat.on('connection', function(socket){

// ============================= TYPING ========================================================

    	socket.on('Typing', function(data){
    		var user_send = data.user_send;
    		var user_recei = data.user_recei;
    		if (online_user[user_recei]){
    			online_user[user_recei].emit('Typing', {user_send : user_send});
    		};
    	})

// ============================= STOP TYPING ===================================================

    	socket.on('stopTyping', function(data){
    		var user_send = data.user_send;
    		var user_recei = data.user_recei;
    		if (online_user[user_recei]){
    			online_user[user_recei].emit('stopTyping', {user_send : user_send});
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


    		if (online_user[user_recei]){
    			online_user[user_recei].emit('readAllMessage', {user_send : user_send});
    		}
    	});

 // ============================= SEND MESSAGE====================================================

 		socket.on('Send message', function(data){
 			var user_send  = data.user_send;
 			var user_recei = data.user_recei;
 			var content    = data.content;
 			var status     = 0;
 			var time       = (new Date).toJSON();


 			// SAVE MESSAGE
 			var message    = new Message;

	 		message.user_send 	= user_send;
	 		message.user_recei	= user_recei;
	 		message.content  	= content;
	 		message.status      = status;
	 		message.time        = time;
	 		message.save(function(err){
	 		})	

	 		// ADD MESSAGE UNREAD OF USER_RECEI

 			if (online_user[user_recei]){
 				User.findOne({_id : user_send}, function(err, user_exist){
 					online_user[user_recei].emit('Send message', 
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
 			delete online_user[socket.id];
 		})
    })
}
