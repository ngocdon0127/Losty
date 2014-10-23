var mime			=	require('mime');

module.exports = function(image_link, extension){
	if( extension != 'png'  && extension != 'jpg' && extension != 'gif' && 
        extension != 'jpeg' && extension != 'bmp' && 
        extension == mime.extension(mime.lookup(image_link)) ){
			return 0;

	} else{
			return 1;
	}
}