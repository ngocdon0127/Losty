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
	console.log('Writing to locate : "./public/img/normal_size/' + type + '/' + path.basename(url_) , '"');

	require('lwip').open('./public' + url.parse(url_).path, function(err, image){
			var batch = image.batch();
			batch.rotate(90, 'white');

	    image.resize(640, 640, function(err, image_resize){
		    image_resize.writeFile('./public/img/normal_size/' + type + '/' + path.basename(url_) , function(err){
		    	if (err){
		    		console.log('Error : ', err);
		    	} else{
		    		console.log('Image resize normal_size success');
		    		callback('./public/img/normal_size/' + type + '/' + path.basename(url_));
		    	}
		    });	    	
	    })
	});
}