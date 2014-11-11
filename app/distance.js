// return distance of location1 and location2

module.exports = function(location1, location2){

	var lat1 = location1.lat;
	var lng1 = location1.lng;

	var lat2 = location2.lat;
	var lng2 = location2.lng;

	var b1   = (lat1 / 180) * Math.PI;
	var b2   = (lat2 / 180) * Math.PI;

	var l1   = (lng1 / 180) * Math.PI;
	var l2   = (lng2 / 180) * Math.PI;

	// var r    = 3986; // mi
	var r    = 6371; 	// km

	var e    = Math.acos( Math.sin(b1)*Math.sin(b2) + Math.cos(b1)*Math.cos(b2)*Math.cos(l2 - l1) );
	return r * e;
}