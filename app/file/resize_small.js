var fs = require('fs');
var url = require('url');
var domain = require('./../../config/default').domain_default;
var im = require('imagemagick');
var path = require('path');
var gm = require('gm').subClass({ imageMagick: true });	    // gm with server
// var gm = require('gm');																			// gm with location
	
module.exports 					=	function(url_, type,  callback){
	gm('./public' + url.parse(url_).path)
		.resize(120, 120)
		.autoOrient()
		.write('./public/img/small_size/' + type + '/' + path.basename(url_), function (err) {
			if (err) {
				console.log('Error : ', err);
			}
			else{
				callback(domain + '/img/small_size/' + type + '/' + path.basename(url_));
			}
		})
}