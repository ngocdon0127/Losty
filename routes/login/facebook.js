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
            	console.log('ERROR : ', new Error(err));
            } else{
	            console.log(data);
	            callback(data);
            }
            
        });
    }


module.exports = function(req, res){

	var access_token = '';

	var profile = {},
	    friends = {},
	    avatar = {};

	async.series([
		function(next){
			access_token = JSON.parse(req.rawBody).access_token;
		    graph.setAccessToken(access_token);

		    graph.extendAccessToken({
		        "access_token":      access_token
		        , "client_id":       client_id
		        , "client_secret":   client_secret
		    }, function (err, facebookRes) {
		    	if (err) {
		    		res.json({err : 'access_token is not authenticate'});
		    		res.status(200).end();
		    	}
		        else {
		        	console.log(facebookRes);
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
			
	    	console.log('Profile : ', profile);
	    	console.log('Friends : ',friends);
	    	console.log('Avatar  : ',avatar);

	    	User.findOne( {'facebook.id' : profile.id}, function(err, user_exist){
	    		if (err){
	    			res.json({err : new Error(err)});
	    			res.status(200).end();
	    		} else{
	    			if ( user_exist){			// USER IS REALLY EXIST
	    				user_exist.facebook.token = access_token;
	    				user_exist.save(function(err){
	    					if (err){
	    						console.log(err);
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
	    						console.log(err);
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

};