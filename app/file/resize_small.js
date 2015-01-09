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
	  image.batch()
	    .scale(0.75)          // scale to 75%
	    .rotate(45, 'white')  // rotate 45degs clockwise (white fill)
	    .crop(200, 200)       // crop a 200X200 square from center
	    .blur(5)              // Gaussian blur with SD=5
	    .writeFile('./public/img/small_size/' + type + '/' + path.basename(url_) , function(err){
	    	if (err){
	    		console.log('Error : ', err);
	    	}
	      // check err...
	      // done.
	    });
	});

}