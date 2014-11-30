var nodemailer = require('nodemailer');
var fs         = require('fs');
var Users      = require('./../../models/users');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'losty.app@gmail.com',
        pass: 'Losty@123456'
    }
});

module.exports          =   function(email, username){
    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols
    var content = '<p>Dear ' + username  + ', Welcome to LostyApp! <br> Please send us an email to losty.app@gmail.com<br>Your Losty Team</p>';

    var mailOptions = {
        from: 'losty.app@gmail.com', // sender address
        to: [email],
        subject: 'Register success Lostyapp',           // Subject line
        text: content,                 // plaintext body
        html: content
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}

