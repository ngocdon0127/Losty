function isNumber(n){
    return typeof n == 'number' && !isNaN(n) && isFinite(n);
}

module.exports		=	function(location){
	if (typeof(location) == 'undefined')
        return 0;
    if (!location.lat || !location.lng || !isNumber(location.lat) || !isNumber(location.lng))
        return 0;
    if (location.lat < -85 || location.lat > 85 || location.lng > 180 || location < -185)
    	return 0;
    return 1;
}