// return city and country of location object

var gm = require('googlemaps');

var _ = require('underscore');

module.exports = function(location, callback){
 	  
 	  var country = '';
    var city = '';

    var locationString = '' + location.lat + ' , ' + location.lng;

   	gm.reverseGeocode(locationString, function(err, data){
        if (err){
          console.log(err);
        };

      	data.results.forEach(function(result_){
         	if (_.isEqual( result_["types"], [ "country", "political" ]) ){
            country = result_.address_components[0].long_name;
          }

          if (_.isEqual( result_["types"], [ "administrative_area_level_1", "political" ]) ){
            city    = result_.address_components[0].long_name;
          }
        });

        callback({city  : city,
          country : country
        });
         		
    })   
    
    // callback ({city : 'HaNoi', country : 'VietNam'});
}


