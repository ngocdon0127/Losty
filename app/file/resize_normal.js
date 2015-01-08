var fs = require('fs');
var path = require('path');
var domain = require('./../../config/default').domain_default;
var im = require('imagemagick');
var url = require('url');
// var gm = require('gm');

module.exports 					=	function(url_, type, callback){
	var gm = require('gm').subClass({ imageMagick: true });
	gm('./public' + url.parse(url_).path)
		.resize(640, 640)
		.autoOrient()
		.write('./public/img/normal_size/' + type +  '/' + path.basename(url_), function (err) {
			if (err) {
				console.log('Error : ', err);
			}
			else{
				callback(domain + '/img/normal_size/' + type + '/' + path.basename(url_));
			}
		})
}