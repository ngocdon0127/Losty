var mime			=	require('mime');

module.exports = function(image_link, extension){
	console.log('type : ', mime.lookup(image_link));
	console.log('extension : ', extension);

	if( extension != 'png'  && extension != 'jpg' && extension != 'gif' && 
        extension != 'jpeg' && extension != 'bmp'){
			return 0;
	} else{
			return 1;
	}
}