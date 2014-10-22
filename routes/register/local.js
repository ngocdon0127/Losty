var   domain = 'http://localhost:8080';

var   formidable    = require('formidable'),
      util          = require('util'),
      fs            = require('fs-extra');

var   mime          = require('mime'),
	  validator     = require('validator');

var   bcrypt        = require('bcrypt-nodejs');
var   make_token    = require('./../../app/make_token');

var   User          = require('./../../models/users');

module.exports = function(req, res) {
	var avatar = 1;
    var username = '';
    var email    = '';
    var password = '';
    var avatar_link = '';
    var extension;
    var temp_path;

    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        username = fields.username;
        email    = fields.email;
        password = fields.password;    
    });

    // WHEN DATA SENT
    form.on('end', function(fields, files) {
        /* Temporary location of our uploaded file */

        // CO KIEM TRA UPLOAD AVATAR
        if (!this.openedFiles[0]){
            avatar = 0;
        } else{
	        temp_path = this.openedFiles[0].path;
	        /* The file name of the uploaded file */
	        
	        extension = mime.extension(mime.lookup(this.openedFiles[0].name)).toLowerCase();
	        if (extension != 'png'  && extension != 'jpg' && extension != 'gif' && 
	        		extension != 'jpeg' && extension != 'bmp'){
		        		avatar = 0;
		        		res.json({err : 'Image is incorrect'});
	        	} 
	    }
	    
	    // VALIDATE FIELS
	    if (!validator.isEmail(email) || !validator.isAlphanumeric(username) || !validator.isLength(password, 6, 25)){
	       	res.json({err : 'Validate fiels is not success'});
	        res.status(200).end();

	    } else{
	        // VALIDATE IS SUCCESS
			// if (avatar){
			User.findOne({$or : [{email : email}, {username : username}]}, function(err, user_exist){
			    if (err) {
			        console.log(err);
			        res.json({err : new Error('Err when find user')});
			        res.status(200).end();
			    }
			    // if user is exist
			    if (user_exist){
			        res.json({err : 'User was exist'});
			        res.status(200).end();
			    } else{
			        var user      =  new User();
			        user.username = username;
			        user.email    = email;
			        user.local.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

			        if (avatar){			                	// HAVE AVATAR


						var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() + '.' + extension;
						/* Location where we want to copy the uploaded file */
						var new_location = '/img/avatar/';
				        fs.copy(temp_path, './public' + new_location + file_name, function(err) {
			                if (err) {
				                console.error(err);
				                res.json({err : new Error(err)});
				                res.status(200).end();
		                    } else {
				                // location of  avatar
				                user.avatar = domain + new_location + file_name;
			                    user.save(function(err){
			                	    if (err) {
				                        console.error(err);
				                        res.json({err : new Error(err)});
				                        res.status(200).end();
				                    }
		                            make_token(user._id, res);
				                  	})
				                }
			        	});
			        } else{			                			// HAVEN'T AVATAR
				        user.save(function(err){
				            if (err) {
				                console.error(err);
				                res.json({err : new Error(err)});
				                res.status(200).end();
				            }
				            make_token(user._id, res);
				        });
			        }       
			    }
			})
	    }
	})        
}