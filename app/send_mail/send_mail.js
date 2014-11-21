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

module.exports          =   function(email){
    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols

    var content = '<p>Dear admin,<br>Thank you for downloading instaMenu! a Restaurant app that makes the ordering & monitoring of a restaurant never been easier..<br>Your admin account information is: Username: admin, <br>Email: vcc.bka@gmail.com, <br>Password: 12345678<br><br>Just login on your iPad to see how E-menu looks like and an ordering process work.<br>Login on this link to go to the backend of the app from here, you can create your own E-menu, user accounts including the roles for a Waitor, Chef, Cashier, or Admin. Important, you can see how the Chef interacts with the Waitor as well as how the Cashier monitors an order and the payment.<br>Got any questions or feedbacks in use, please post your issues on this link http://www.forum.campcoders.com. We will try our best to provide timely support 24/7 for you. <br>Thank you very much!<br>instaMenu team<br></p>' // html body;

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

