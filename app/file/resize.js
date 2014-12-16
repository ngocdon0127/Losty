var fs = require('fs');
var url = require('url');
var domain = require('./../../config/default').domain_default;
var im = require('imagemagick');

var gm = require('gm').subClass({ imageMagick: true });	    // gm with server

// var gm = require('gm');																			// gm with location
	
module.exports 					=	function(url_, callback){
	gm('./public' + url.parse(url_).path)
		.resize(120, 120)
		.autoOrient()
		.write('./public/small_size' + url.parse(url_).path, function (err) {
			if (err) {
				console.log(err);
			}
			else{
				console.log('RESIZE SUCCESS');
				callback(domain + '/small_size' + url.parse(url_).path);
			}
		})
}