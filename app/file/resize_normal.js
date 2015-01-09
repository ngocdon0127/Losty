var fs = require('fs');
var path = require('path');
var domain = require('./../../config/default').domain_default;
var im = require('imagemagick');
var url = require('url');
// var gm = require('gm');

module.exports 					=	function(url_, type, callback){
	// var gm = require('gm').subClass({ imageMagick: true });
	// gm('./public' + url.parse(url_).path)
	// 	.resize(640, 640)
	// 	.autoOrient()
	// 	.write('./public/img/normal_size/' + type +  '/' + path.basename(url_), function (err) {
	// 		if (err) {
	// 			console.log('Error : ', err);
	// 		}
	// 		else{
	// 			callback(domain + '/img/normal_size/' + type + '/' + path.basename(url_));
	// 		}
	// 	})

	require('lwip').open('./public' + url.parse(url_).path, function(err, image){

	  // check err...
	  // define a batch of manipulations and save to disk as JPEG:
	  image.batch()
	    .scale(0.75)          // scale to 75%
	    .rotate(45, 'white')  // rotate 45degs clockwise (white fill)
	    .crop(640, 640)       // crop a 200X200 square from center
	    .blur(5)              // Gaussian blur with SD=5
	    .writeFile('./public/img/normal_size/' + type + '/' + path.basename(url_) , function(err){
	    	if (err){
	    		console.log('Error : ', err);
	    	} else{
	    		console.log('Image resize normal_size success');
	    	}
	      // check err...
	      // done.
	    });

	});

}