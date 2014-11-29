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
		var results = [];
		var result_msg;
		// result : [{avatar, id, username, messages : [] }, {}, {}, ...]
	}

	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	}

	finally{
		validate_token(user_id, token, function(valid){
			if (valid){
				Users.findOne({_id : user_id}, function(err, me){
					console.log(me);
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

									Users_online.findOne({id : user_chat.id}, function(err, user_online){
										if (user_online) online = 1;
									})

									Messages.find({$or : [{user_send : me._id, user_recei : user_chat.id}, 
				          										{user_send : user_chat.id, user_recei : me._id}] }, function(err, messages){

				          	async.waterfall([
				          		function(next2){
						          	result_msg = messages;	
												result_msg.sort(function(a,b){
													return new Date(b.time) - new Date(a.time);
												});

												process.nextTick(function(){
													next2(null);
												});
							         },

							        function(next2){
							        	console.log(result_msg[0]);

							        	// result_msg.slice(start, start + limit);	
							        	next2(null);
							        },
							      ], function(err){
											results.push({id : user_chat.id, avtar : user_chat.avatar, username : user_chat.username, 
							          						online : online, messages : result_msg[0]
							        });
							        next1(null);
							      });
							      });
								});

							}, 

							function(next1){
								// sort result
								results.sort(function(a, b){
									return new Date(b.messages[0].time) - new Date(a.messages[0].time);
								})
								process.nextTick(function(){
									// console.log(results);
									next1(null);
								})
							}

						], function(err){
							res.json({error_code : 0, inbox : results});
							res.status(200).end();
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