var   formidable    = require('formidable'),
      util          = require('util'),
      fs            = require('fs-extra'),
      mime			= require('mime');

var form = new formidable.IncomingForm();

module.exports 			=	function(req, res){
	console.log('in Upload photo');
    

    // PARSE FORM-DATA
    form.parse(req, function(err, fields, files) { });


    form.on('end', function(fields, files){
    	if (!this.openedFiles[0]){
    		res.json({err : 'Have not image'});
    		res.status(200).end();
    	} else{
    		var temp_path	=	this.openedFiles[0].path;
    		var extension   =   mime.extension(mime.lookup(this.openedFiles[0].name)).toLowerCase();
    		res.json({err : null, image_link : temp_path , extension : extension});
    		res.status(200).end();
    	} 
    })

}	