// var dev_port 					 = 3000;
// var dev_domain 			   = 'localhost';

var dev_port 					 	   =  3000;
var dev_domain 			   		 = '104.131.69.233';

exports.port   					   = [dev_port + 1, dev_port + 2, dev_port + 3, dev_port + 4];

exports.avatar_default = 'http://' + dev_domain + ':' + dev_port + '/img/full_size/avatar/default-avatar.png';

exports.domain_default = 'http://' + dev_domain + ':' + dev_port;

exports.database       = 'mongodb://' + dev_domain + '/losty/user';
