var dev_port 					 = 8080;
var dev_domain 			   = 'localhost';

exports.port					 = dev_port;

exports.avatar_default = 'http://' + dev_domain + ':' + dev_port + '/img/avatar/default-avatar.png';

exports.domain_default = 'http://' + dev_domain + ':' + dev_port;

exports.database       = 'mongodb://' + dev_domain + '/losty/user';