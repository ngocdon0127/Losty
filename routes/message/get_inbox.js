var async             = require('async');

var validate_token    = require('./../../app/validate/validate_token');

var Messages          = require('./../../models/messages');
var Users             = require('./../../models/users');

var start = 0, 
    limit = 20;



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

							function(next){
								// get message, infor user and push into array
								users_chat.forEach(function(user_chat){
									console.log('user chat :', user_chat);
									console.log('my id and my friend :', me._id, user_chat._id);
									Messages.find({$or : [{user_send : me._id, user_recei : user_chat.id}, 
				          										{user_send : user_chat.id, user_recei : me._id}] }, function(err, messages){

				          	async.waterfall([
				          		function(next){
				          			console.log(messages);
						          	result_msg = messages;	
												result_msg.sort(function(a,b){
													return new Date(b.time) - new Date(a.time);
												});
												result_msg.slice(start, start + limit);	

												process.nextTick(function(){
													next(null);
												});
							         }
							      ], function(err){
											results.push({id : user_chat.id, avtar : user_chat.avatar, username : user_chat.username,
							          						messages : result_msg});
							         });
							      });
								});
								process.nextTick(function(){
									next(null);
								});
							}, 

							function(next){
								// sort result
								results.sort(function(a, b){
									return new Date(b.messages[0].time) - new Date(a.messages[0].time);
								})
								process.nextTick(function(){
									// console.log(results);
									next(null);
								})
							}

						], function(err){
							console.log('send data : ',results);
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