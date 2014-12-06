var fs = require('fs');
var url = require('url');
var domain = require('./../../config/default').domain_default;
var im = require('imagemagick');
var gm = require('gm').subClass({ imageMagick: true });
// var gm = require('gm');



module.exports 					=	function(url_, callback){
	gm('./public' + url.parse(url_).path)
		.resize(640, 640)
		.autoOrient()
		.write('./public/normal' + url.parse(url_).path, function (err) {
			if (err) {
				console.log(err);
			}
			else{
				console.log('RESIZE SUCCESS');
				callback(domain + '/normal' + url.parse(url_).path);
			}
		})
}