Losty
=====
Complate API:
    // REGISTER, LOGIN, LOGOUT =================
    Router_raw.post('/login', 		  		routes.login.local);          	// api login with local account
    Router_raw.post('/register', 			routes.register.local);       	// api register with local account
    Router_raw.post('/logout', 		  		routes.logout);					// api logout 
    
    // UPLOAD PHOTO
    Router_formdata.post('/upload_photo',	routes.upload_photo);			// api upload photo, return link '/tmp'
    
    // UPLOAD PHOTO_ITEM
    Router_raw.post('/set_photo',   		routes.photo.set);				// api set photo
    Router_raw.post('/del_photo',			routes.photo.del);				// api del photo
    
    // CREATE, UPDATE, VIEW, REMOVE ITEMS
    Router_raw.post('/set_an_item', 		routes.item.set);        		// api create, update an item
    Router_raw.get('/get_an_item/:id',	 	routes.item.get);				// api get an  item
    Router_raw.post('/del_an_item', 		routes.item.del);				// api del an  item
    
    // CREATE, UPDATE, VIEW, REMOVE CATEGORES
    Router_raw.post('/set_a_category', 		routes.category.set);			// api create,update categores   (ONLY ADMIN)
    Router_raw.get('/get_categores',  		routes.category.get);			// api get categores
