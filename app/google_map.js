exports.getPostalcode       =   function(location){
	var geocoder = require('geocoder');

	geocoder.reverseGeocode( location.lat, location.lng, function ( err, data ) {
	  // do something with data

	  console.log(data.results);
	});
}