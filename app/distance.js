// return distance of location1 and location2

module.exports = function(location1, location2){

	console.log(location1, location2);
	location1 = JSON.parse(location1);

	var lat1 = location1.lat;
	var lng1 = location1.lng;

	var lat2 = location2.lat;
	var lng2 = location2.lng;

	console.log(lat1, lat2, lng1, lng2);

	var b1   = (lat1 / 180) * Math.PI;
	var b2   = (lat2 / 180) * Math.PI;

	var l1   = (lng1 / 180) * Math.PI;
	var l2   = (lng2 / 180) * Math.PI;

	var r    = 3986;

	console.log(Math.sin(b1));

	var e    = Math.acos( Math.sin(b1)*Math.sin(b2) + Math.cos(b1)*Math.cos(b2)*Math.cos(l2 - l1) );
	console.log(e);
	return r * e;
}