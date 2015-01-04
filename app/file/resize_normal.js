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
		.write('./public/normal_size' + url.parse(url_).path, function (err) {
			if (err) {
				console.log('Error : ', err);
			}
			else{
				console.log('Resize normal photo success');
				callback(domain + '/normal_size' + url.parse(url_).path);
			}
		})
}