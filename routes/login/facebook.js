var client_id       =   require('./../../app/auth').client_id_fb;
var client_secret   =   require('./../../app/auth').client_secret_fb;

// var client_id          =   '1495985440641529';
// var client_secret      =   '0ef9188327f12b29bbe76bf5a274cfe7';

var async			   =	require('async');
var graph 			   = 	require('fbgraph');
  
var make_token         = 	require('./../../app/make_token');
var add_friend_fb      =    require('./../../app/add_friend_fb');

var User               =    require('./../../models/users');

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
            	res.json({error_code : 600});			//	Have error
            	res.status(200).end();
            } else{
	            callback(data);
            }
            
        });
    }


module.exports = function(req, res){	
	console.log('Have request');

	var access_token = '';

	var profile = {},
	    friends = {},
	    avatar = {};

	if (!req.rawBody){
		res.json({error_code : 201});
		res.status(200).end();
	} else{

		async.series([
			function(next){
				access_token = JSON.parse(req.rawBody).access_token;
				console.log(access_token);
			    graph.setAccessToken(access_token);

			    graph.extendAccessToken({
			        "access_token":      access_token
			        , "client_id":       client_id
			        , "client_secret":   client_secret
			    }, function (err, facebookRes) {
			    	if (err) {
			    		res.json({error_code : 101});			//	Access_token is incorrect
			    		res.status(200).end();
			    	}
			        else {
			        	next(null);
			        }
			    });
			},
			function( next){
			    API("/me",  function(data){
			    	profile = data;
			    	next(null);
			    });
			},
			function( next){
			    API("/me/friends", function(data){
			    	friends = data.data;
			    	next(null);
			    });
			},
			function(next){
			    API("me?fields=picture.width(800).height(800)&redirect=false", function(data){
				    avatar = data.picture.data.url;
				    next(null);
			    });

			}], function(err){
				
		    	// console.log('Profile : ', profile);
		    	// console.log('Friends : ',friends);
		    	// console.log('Avatar  : ',avatar);

		    	User.findOne( {'facebook.id' : profile.id}, function(err, user_exist){
		    		if (err){										// database cannot find
		    			res.json({error_code : 401});
		    			res.status(200).end();
		    		} else{
		    			if ( user_exist){			// USER IS REALLY EXIST
		    				user_exist.facebook.token = access_token;
		    				user_exist.save(function(err){
		    					if (err){
		    						res.json({error_code : 402});
		    						res.status(200).end();			//	database cannot save
		    					}
		    				});

		    				make_token(user_exist, res);
		    			}
		    			else{						// USER IS NOT EXIST
		    				var user      		= new User;
		    				user.username 		= profile.name;
		    				user.email    		= profile.email;
		    				user.avatar   		= avatar;
		    				user.facebook.id 	= profile.id;
		    				user.facebook.token = access_token;
		    				user.save(function(err){
		    					if (err){
		    						res.json({error_code : 402});
		    						res.status(200).end();			//	database cannot save
		    					} else{
		    						process.nextTick(function(){
		    							// Add friends
		    							add_friend_fb(user._id, friends);
		    							make_token(user, res);
		    						})
		    					}
		    				})
		    			}
		    		}
		    	})

	    
			});
	}
};