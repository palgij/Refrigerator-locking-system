let nodemailer	= require("nodemailer"),
    errorCodes  = require("./errorCodes");

module.exports.sendMail = (subject, html) => {
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
    transporter.sendMail(mailOptions, (err) => {
        if(err) {
	    console.log(errorCodes.MAIL_ERROR.message);
            console.log(`SEND MAILI OMA ERROR:\n${err}\n`);
        } else {
            console.log("Meili saatmine õnnestus!");
        }
    });
};