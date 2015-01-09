var   formidable    = require('formidable'),
      util          = require('util'),
      fs            = require('fs-extra'),
      mime			    = require('mime');

var Photo               = require('./../../models/photos');                

var domain              = require('./../../config/default').domain_default;
var resize_small        = require('./../../app/file/resize_small');
var resize_normal       = require('./../../app/file/resize_normal');

var async               = require('async');

var   validate_token= require('./../../app/validate/validate_token');


function resize_(res, user_id, files, dem){
	  var name 			  =   Object.keys(files)[dem];

    var temp_path   =   files[name].path;
    var extension   =   mime.extension(files[name].type).toLowerCase();  

    var photo       =   new Photo;
    photo.name      =   name;
    var new_location = '/img/full_size/photo/';

    var file_name = Math.floor(Math.random() * 1000000 + 1) + new Date().getTime() + '.' + extension;

    fs.rename(temp_path, './public' + new_location + file_name, 
            function(err){
      if (err){
        res.json({error_code : 202, msg : err.toString()});     
        res.status(200).end()
      } else{
        async.waterfall([
            function(next){
              photo.image_link = domain + new_location + file_name;
              photo.user_id    = user_id;
              resize_small(photo.image_link, 'photo', function(image_link_small){
                photo.image_link_small = image_link_small;
                resize_normal(photo.image_link, 'photo', function(image_link_normal){
                  photo.image_link_normal = image_link_normal;
                  next(null);
                })
              })
            }
        ], function(err){
          photo.save(function(err){
            if (err){
              res.json({error_code : 402, msg : err.toString()});    
              res.status(200).end()       //  save
              return 1;
            } else{
                console.log('save photo successsss');                         
                console.log(dem);
                if (dem == Object.keys(files).length){
                  res.json({error_code : 0});
                  res.status(200).end();
                } else{
                	resize_(res, files, dem + 1);
                }
            }
           });
        });
       }
    })	
}

module.exports 			=	function(req, res){ 
	// console.log(req);

  try{
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) { 
      if (err){
        res.json({error_code : 201, msg : err.toString()});         //  Input is invalid
        res.status(200).end();
      } else{
        var user_id = fields['user[user_id]'];
        var token   = fields['user[token]'];
        validate_token(user_id, token, function(valid){
          if (!valid){
            res.json({error_code : 100, msg : 'Authenticate is not success'});
            res.status(200).end();
          } else{
          	console.log('Foreach files');
            var i = 0;
            var dem = 0;
            console.log(files);
            if (Object.keys(files).length > 0){
              resize_(res, user_id, files, 0);
            } else{
               res.json({error_code : 0});
               res.status(200).end();
            }       
          }
        })
      }
    });

    form.on('error', function(err) {
      console.log(err);
      res.json({error_code : 201, msg : err.toString()});         //  Input is invalid
      res.status(200).end();

    });

    form.on('end', function(fields, files){
    	console.log('end');
    })
  }

  catch(err){
    res.json({error_code : 201, msg : err.toString()});             //  Input is invalid
    res.status(200).end();
  }

  finally{
  	console.log('finally');
  }
}	