var fs = require('fs');
var url = require('url');
var domain = require('./../../config/default').domain_default;
var im = require('imagemagick');
var gm = require('gm');



module.exports 					=	function(url_, callback){
	console.log('./public/small_size' + url.parse(url_).path);

	gm('./public' + url.parse(url_).path)
		.resize(120, 120)
		.autoOrient()
		.write('./public/small_size' + url.parse(url_).path, function (err) {
			if (!err) console.log(' hooray! ');
		})
	console.log(domain + '/small_size' + url.parse(url_).path);
	callback(domain + '/small_size' + url.parse(url_).path);

}