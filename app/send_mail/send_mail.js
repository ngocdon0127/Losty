var nodemailer = require('nodemailer');
var fs         = require('fs');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'losty.app@gmail.com',
        pass: 'Losty@123456'
    }
});

module.exports          =   function(email, key){
    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols

    var content = '<p>Dear cuongvu, <br>We received a request to reset the password of your account. <br> If you made this request, please click the link below to get it back, or just ignore this email. <br> Link reset password : http://104.131.69.233:3000/api/reset_password/' + key + '</p>';

    var mailOptions = {
        from: 'losty.app@gmail.com', // sender address
        to: [email],
        subject: 'Hello',           // Subject line
        text: content,                 // plaintext body
        html:  content
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

