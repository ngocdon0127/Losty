var   formidable    = require('formidable'),
      util          = require('util'),
      fs            = require('fs-extra'),
      mime			    = require('mime');

var Photo               = require('./../../models/photos');                

var domain              = require('./../../config/default').domain_default;
var resize              = require('./../../app/file/resize');
var async               = require('async');

var   validate_token= require('./../../app/validate/validate_token');

var form = new formidable.IncomingForm();

module.exports 			=	function(req, res){ 

  // PARSE FORM-DATA
  try{
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) { 
      if (err){
        res.json({error_code : 201, msg : err.toString()});         //  Input is invalid
        res.status(200).end();
      } else{
        var user_id = fields.user_id;
        var token   = fields.token;
        console.log(user_id, token);
        validate_token(user_id, token, function(valid){
          if (!valid){
            res.json({error_code : 100, msg : 'Authenticate is not success'});
            res.status(200).end();
          } else{
            Object.keys(files).forEach(function(name){
              var temp_path   =   files[name].path;
              var extension   =   mime.extension(files[name].type).toLowerCase();  

              var photo       =   new Photo;
              photo.name      =   name;
              var new_location = '/img/photo/';

              var file_name = Math.floor(Math.random() * 1000000 + 1) + 
                        new Date().getTime() + '.' + extension;

              fs.rename(temp_path, './public' + new_location + file_name, 
                function(err){
                  if (err){
                    res.json({error_code : 202, msg : err.toString()});     //  Image link is incorrect
                    res.status(200).end()
                  } else{
                    async.waterfall([
                      function(next){
                        photo.image_link = domain + new_location + file_name;
                        photo.user_id    = user_id;

                        resize(photo.image_link, function(image_link_small){
                          photo.image_link_small = image_link_small
                          next(null);
                        })
                      }
                    ], function(err){
                      photo.save(function(err){
                        if (err){
                          res.json({error_code : 402, msg : err.toString()});     //  Database cannot 
                          res.status(200).end()       //  save
                        } else{
                          console.log('save photo success');
                        }
                      });
                    });
                  }
                })
            })           
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
      
      // console.log('This.openedFiles : ', this.openedFiles);
      // if (!this.openedFiles[0]){
      //   res.json({error_code : 201, msg : 'File is incorrect'});    //  Input is invalid
      //   res.status(200).end();
      // } else{
      //   var temp_path	=	this.openedFiles[0].path;
      //   var extension   =   mime.extension(this.openedFiles[0].type).toLowerCase();                   
      //   res.json({error_code : 0, image_link : temp_path, extension : extension});
      //   res.status(200).end();
      // } 

    })
  }
  catch(err){
    res.json({error_code : 201, msg : err.toString()});             //  Input is invalid
    res.status(200).end();
  }
  finally{
    res.json({error_code : 0});             //  Input is invalid
    res.status(200).end();

  }
}	