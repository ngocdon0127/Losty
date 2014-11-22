var User 						=	require('./../../models/users');

module.exports			=	function(req, res){
	try{
		var data				=	req.body;
		var user_id1 		=	data.user_id1;
		var user_id2 		=	data.user_id2;
	}
	catch(err){

	}
	finally{
		User.findOne({_id : user_id1}, function(err, user1){
				User.findOne({_id : user_id2}, function(err, user2){

					// if ((user1.Friend.indexOf({id:user2._id, avatar:user2.avatar, username:user2.username })) == -1){
						user1.Friend.push({id 	   : user2._id, 
												    avatar   : user2.avatar, 
													  username : user2.username
													});

						user2.Friend.push({id 	   : user1._id, 
													    avatar   : user1.avatar, 
														  username : user1.username
														});

						user2.save(function(err){});
						user1.save(function(err){});	
						// }
					
					res.status(200).end();
				})
		})
	}
}