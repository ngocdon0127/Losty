// remove file with url is file_url

var url                   = require('url');
var fs 										=	require('fs');

module.exports						=	function(file_url){
	// url : "http://localhost:8080/img/item/1416412538603.jpeg" || 
	//       "http://104.131.69.233:3000/img/avatar/default-avatar.png"

	file_path  							= './public/' + url.parse(file_url).path;
	if (fs.existSync(file_path))
		fs.unlink(file_path, function(){
			return 1;
		});

}