module.exports = function() {
	var cp = require('child_process');
	setInterval(function() {
		var child = cp.spawn('nodejs a.js');

		child.on('error', function(error) {
			console.log('Child process error : ', error);
		})

		child.on('exit', function(code, signal) {
			console.log('Child process is exit');
		})

		child.on('close', function(code, signal) {
			console.log('Child process is close');
		})

	}, 10000);
}();