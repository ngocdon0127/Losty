var fs = require("fs");
var domain = require("domain").create();
 
domain.run(function() {

	throw new Error('b');
	
	fs.readFile("", "utf8", function(error, data) {
		if (error) {
			throw new Error('a');
		}
		 
		console.log(data);
		domain.dispose();
	});
});
 
domain.on("error", function(error) {
	console.log(error.toString())
}); 
	