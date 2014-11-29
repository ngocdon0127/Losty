var async             = require('async');

var validate_token    = require('./../../app/validate/validate_token');

var Messages          = require('./../../models/messages');
var Users             = require('./../../models/users');
var Users_online    =   require('./../../models/users_online');


var start = 0, 
    limit = 1;



module.exports 				=	function(req, res){
	try{
		var data = req.body;
		// data : {user : {user_id, token }}
		var user_id = data.user.user_id;
		var token   = data.user.token;
		// result : [{avatar, id, username, messages : [] }, {}, {}, ...]
	}

	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	}

	finally{
		var results = [];
		var result_msg;

		validate_token(user_id, token, function(valid){
			if (valid){
				// Find me
				Users.findOne({_id : user_id}, function(err, me){
					if (err){

						res.json({error_code : 201, msg : err.toString()});
						res.status(200).end();

					} else if (!me){
						// user khong ton tai
						res.json({error_code : 308, msg : 'User is not exist'});
						res.status(200).end();
					} else{
						var users_chat = me.users_chat;

						async.waterfall([

							function(next1){
								// get message, infor user and push into array
								users_chat.forEach(function(user_chat){

									var online = 0;

									// Xet tung user chat cung minh, user nao dang online thi online = 1, 
									// khong thi online = 0
									Users_online.findOne({id : user_chat.id}, function(err, user_online){
										if (user_online) online = 1;
									})

									Messages.find({$or : [{user_send : me._id,       user_recei : user_chat.id}, 
				          										  {user_send : user_chat.id, user_recei : me._id}] }, 
				          										  function(err, messages){
				          	async.waterfall([
				          		function(next2){

				          			// sort message by time
						          	result_msg = messages;	
												result_msg.sort(function(a,b){
													return new Date(b.time) - new Date(a.time);
												});

												next2(null);
							        }

							      ], function(err){
												results.push({id : user_chat.id, avatar : user_chat.avatar, username : user_chat.username, 
							          						online : online, messages : result_msg[0]});
							        	next1(null);
							      });
							    });
								});

							}, 

							function(next1){
								// sort result

								results.sort(function(a, b){
									return new Date(a.messages.time) - new Date(b.messages.time);
								})
								setTimeout(function(){
									next1(null);
								}, 100)
							}

						], function(err){
								setTimeout(function(){
									res.json({error_code : 0, result : results});
									res.status(200).end();	
								}, 1000)
								
						})
					}
				})
			} else{
				res.json({error_code : 100, msg : 'Authenticate is incorrect'});
				res.status(200).end();
			}
		})
	}
}