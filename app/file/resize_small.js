var fs = require('fs');
var url = require('url');
var domain = require('./../../config/default').domain_default;
var im = require('imagemagick');
var path = require('path');
// var gm = require('gm');																			// gm with location
	
module.exports 					=	function(url_, type,  callback){
	console.log('Writing to locate : "./public/img/small_size/' + type + '/' + path.basename(url_) , '"');
	// var gm = require('gm').subClass({ imageMagick: true });	    // gm with server
	// gm('./public' + url.parse(url_).path)
	// 	.resize(120, 120)
	// 	.autoOrient()
	// 	.write('./public/img/small_size/' + type + '/' + path.basename(url_), function (err) {
	// 		if (err) {
	// 			console.log('Error : ', err);
	// 		}
	// 		else{
	// 			callback(domain + '/img/small_size/' + type + '/' + path.basename(url_));
	// 		}
	// 	})

	require('lwip').open('./public' + url.parse(url_).path, function(err, image){
	    var batch = image.batch();
			batch.rotate(45, 'white').scale(0.5).blur(5);

	    image.resize(200, 200, function(err, image_resize){
		    image_resize.writeFile('./public/img/small_size/' + type + '/' + path.basename(url_) , function(err){
		    	if (err){
		    		console.log('Error : ', err);
		    	} else{
		    		console.log('Image resize small_size success');
		    		callback('./public/img/small_size/' + type + '/' + path.basename(url_));
		    	}
		    });	    	
	    })

	});

}