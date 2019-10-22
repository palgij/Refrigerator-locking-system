let nodemailer	= require("nodemailer"),
    errorCodes  = require("./errorCodes");

module.exports.sendMail = (subject, req, html, next) => {
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
            console.log(`SEND MAILI OMA ERROR:\n${err}\n`);
            let err2 = new Error(errorCodes.MAIL_ERROR.message);
            err2.statusCode = errorCodes.MAIL_ERROR.code;
            next(err2);
        } else {
            req.flash("SUCCESS2", "Oota Bibendi kinnitust.", "/");
        }
    });
};