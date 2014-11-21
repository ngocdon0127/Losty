var flash        = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var express      = require('express');

var favicon = require('serve-favicon');

module.exports = function(app, Router_raw, Router_formdata, Router_body){
   
    app.use(morgan('dev')); // log every request to the console
    app.use(cookieParser()); // read cookies (needed for auth)
    app.use(bodyParser()); // get information from html forms

    app.set('view engine', 'ejs');
    app.set('views', __dirname + './../views');
    app.use(express.static(__dirname + './../public'));
    // app.use(favicon(__dirname + '/public/favicon.ico'));

    Router_body.use(function(req, res, next){
    	console.log('\n' + new Date);
    	next();
    })

    Router_raw.use(function(req, res, next) {
      console.log('\n' + new Date);
      req.rawBody = '';
      req.setEncoding('utf8');

      req.on('data', function(chunk) {
        req.rawBody += chunk;
      });

      req.on('end', function() {
        next();
      });
    });

    app.use('/api', Router_formdata);
    // app.use('/api', Router_raw);
    app.use('/api', Router_body);

}

