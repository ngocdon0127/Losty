// return city and country of location object

var gm = require('googlemaps');

var _ = require('underscore');

module.exports = function(location, callback){
 	
 	var address = {'city' : '', 'country' : ''};

    var locationString = '' + location.lat + ' , ' + location.lng;

   	gm.reverseGeocode(locationString, function(err, data){
        console.log(err);
      	data.results.forEach(function(result_){
         	if (_.isEqual( result_["types"], ['administrative_area_level_1','political']) ){
         		callback({city  : result_.address_components[0].long_name,
         				country : result_.address_components[1].long_name
         		});
         		return 1;
         	}
       })   
      	// 
   	});  	

    // callback ({city : 'HaNoi', country : 'VietNam'});
}


