let nodemailer	= require("nodemailer");

module.exports.sendMail = (subject, req, html) => {
    let transporter = nodemailer.createTransport({
 	service: 'gmail',
 	auth: {
            user: "ollesusteem@gmail.com",
            pass: "vironialukutaha19"
        }
    });
    const mailOptions = {
  	from: "ollesusteem@gmail.com",
  	to: "palgijoel@gmail.com",
  	subject: subject,
	html: html
    };
    transporter.sendMail(mailOptions, (err, info) => {
   	if(err) {
     	    console.log(err);
	    req.flash("WARN", "Meili saatmine ebaõnnestus. Võta Bibendiga ühendust.", "/");
	}
   	else {
	    req.flash("SUCCESS2", "Oota Bibendi kinnitust.", "/");
	}
    });	
};