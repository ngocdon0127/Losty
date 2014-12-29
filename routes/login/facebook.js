var client_id       			=   require('./../../app/authen/auth').client_id_fb;
var client_secret   			=   require('./../../app/authen/auth').client_secret_fb;

var reverseGeocode  		  = 	require('./../../app/map/reverseGeocode');

// var client_id          =   '1495985440641529';
// var client_secret      =   '0ef9188327f12b29bbe76bf5a274cfe7';

var async			  				  =		require('async');
var graph 			   				= 	require('fbgraph');
  
var make_token         		= 	require('./../../app/authen/make_token');
var add_friend_fb      		=    require('./../../app/add_friend/add_friend_fb');

var User               		=    require('./../../models/users');

var options = {
    timeout:  3000
    , pool:     { maxSockets:  Infinity }
    , headers:  { connection:  "keep-alive" }
};


function  API(api, callback){
  graph
    .setOptions(options)
    .get(api, function(err, data) {
      if (err) {
       	callback(err, null);
      } else{
	      callback(null, data);
      }    
    });
  }


module.exports = function(req, res){	
	var access_token = '';

	var profile = {},
	    friends = {},
	    location = {},
	    avatar = {};


	try{

		access_token = req.body.access_token;
		// get location from req
		location     = req.body.location;

	}
	catch(err){
		res.json({error_code : 201, msg : err.toString()});
		res.status(200).end();
	} 
  finally{
		async.series([
			function(next){
			  graph.setAccessToken(access_token);

			  graph.extendAccessToken({
			    "access_token":      access_token
			    , "client_id":       client_id
			    , "client_secret":   client_secret
			  }, function (err, facebookRes) {
			    if (err) {
			    	res.json({error_code : 100, msg : err.message});			  //	Access_token is incorrect
			   		res.status(200).end();
			    } else {
			      next(null);
			    }
			  });
			},


			function( next){																								// GET PROFILE
			    API("/me/permissions", function(err, data){
			    		console.log(data);
			    		next(null);		
  	
			    });
			},

			function( next){																								// GET PROFILE
			    API("/me", function(err, data){
			    	if (err){
			    		console.log(err);
			       	res.json({error_code : 600, msg : err.message});			//	Have error
			       	res.status(200).end();
			    	} else{
			    		profile = data;
			    		next(null);		
			    	}  	
			    });
			},
			function( next){
			    API("/me/friends", function(err, data){											// GET FRIENDS
			    	console.log(data);
			    	if (err){
			    		console.log(err);
			       	res.json({error_code : 600, msg : err.message});			//	Have error
			       	res.status(200).end();
			    	} else{
				    	friends = data.data;
				    	next(null);
				    }
			    });
			},

			// function( next){
			//     API("/me/locations", function(err, data){											// GET FRIENDS
			//     	if (err){
			//     		console.log(err);
			//        	res.json({error_code : 600, msg : err.message});			//	Have error
			//        	res.status(200).end();
			//     	} else{
			//     		console.log(data);
			// 	    	locations = data.data;
			// 	    	next(null);
			// 	    }
			//     });
			// },

			function(next){
			    API("me?fields=picture.width(800).height(800)&redirect=false", function(err, data){
			    	if (err){
			    		console.log(err);
			       	res.json({error_code : 600, msg : err.message});			//	Have error
			       	res.status(200).end();
			    	} else{
					    avatar = data.picture.data.url;												  // GET AVATAR
					    next(null);	
					  }
			    });

			}], function(err){
						if (err){
							console.log(err);
						}

						console.log(friends);

			    	User.findOne( {'facebook.id' : profile.id}, function(err, user_exist){
			    		if (err){																									// database cannot find
			    			res.json({error_code : 401, msg : err.toString()});
			    			res.status(200).end();
			    		} else{
			    			if ( user_exist){																				// USER IS REALLY EXIST
			    				user_exist.facebook.token = access_token;
			    				user_exist.save(function(err){
			    					if (err){
			    						res.json({error_code : 402, msg : err.toString()});
			    						res.status(200).end();			//	database cannot save
			    					}
			    				});
			    				make_token(user_exist, res);
			    			}
			    			else{						// USER IS NOT EXIST, MAKE NEW USER
			    				var user      				= new User;
			    				user.username 				= profile.name;
			    				user.type_account 		= 2;
			    				user.exist_acc[2]     = 1;
			    				user.email    				= profile.email;
			    				user.avatar   				= avatar;
			    				user.avatar_small     = avatar;
			    				user.facebook.email   = profile.email;
			    				user.facebook.id 			= profile.id;
			    				user.facebook.token 	= access_token;

				    			reverseGeocode(location, function(data){
	                  user.city    = data.city;
	                  user.country = data.country;

	                  process.nextTick(function(){
					    				user.save(function(err){
					    					if (err){
					    						res.json({error_code : 402, msg : err.toString()});  //	database cannot save
					    						res.status(200).end();			
					    					} else{
					    						process.nextTick(function(){
					    							// Add friends
					    							console.log('Di tim ban');
					    							add_friend_fb(user._id, friends, function(){
					    								make_token(user, res);	
					    							});
					    						})
					    					}
					    				})                               
	                  });
	                });

			    			}
			    		}
			    	})    
		})
  }
};