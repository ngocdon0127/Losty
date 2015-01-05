var fs = require('fs');
var url = require('url');
var domain = require('./../../config/default').domain_default;
var im = require('imagemagick');

var gm = require('gm').subClass({ imageMagick: true });	    // gm with server
// var gm = require('gm');																			// gm with location
	
module.exports 					=	function(url_, callback){
	console.log(url.parse(url_).path);
	gm('./public' + url.parse(url_).path)
		.resize(120, 120)
		.autoOrient()
		.write('./public/img/small_size' + url.parse(url_).path, function (err) {
			if (err) {
				console.log('Error : ', err);
			}
			else{
				console.log('Resize small photo success');
				callback(domain + '/img/small_size' + url.parse(url_).path);
			}
		})
}