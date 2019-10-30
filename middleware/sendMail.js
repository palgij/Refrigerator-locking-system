let nodemailer	= require("nodemailer"),
    errorCodes  = require("./errorCodes");

let userIds = [];
let monthNames = ["Jaanuarikuu", "Veebruarikuu", "Märtsikuu", "Aprillikuu", "Maikuu", "Juunikuu", "Juulikuu", "Augustikuu", "Septembrikuu", "Oktoobrikuu", "Novembrikuu", "Detsembrikuu"];
module.exports.userIds = userIds;

module.exports.sendMail = (subject, html, id) => {
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
        if (err) {
	    console.log(errorCodes.MAIL_ERROR.message);
            console.log(`SEND MAILI OMA ERROR:\n${err}\n`);
        } else {
            console.log("Meili saatmine õnnestus!");
	    userIds.push(id);
        }
    });
};

module.exports.bibendileMeil = (csv, olleSumma) => {
    let html = getHtml(csv, olleSumma);

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "ollesusteem@gmail.com",
            pass: "vironialukutaha19"
        }
    });
    const mailOptions = getMailOptions(csv, html);

    return new Promise((resolve, reject) => { 
    	transporter.sendMail(mailOptions, (err) => {
            if (err) {
	    	console.log(`SEND MAILI OMA ERROR:\n${err}\n`);
	    	let err2 = new Error(errorCodes.BIBENDI_MAIL_ERROR.message);
  	    	err2.statusCode = errorCodes.BIBENDI_MAIL_ERROR.code;
  	    	reject(err2);
            } else {
            	console.log("Meili saatmine õnnestus!");
		resolve(true);
            }
    	});
    });
};

let getHtml = (csv, olleSumma) => {
    if (csv.length === 0) {
	return `<p>Hei Laekur<br><br>
		Rebaste tasuta joodud joogid (õlu/alkovaba) ${monthNames[new Date().getMonth() - 1]}s: <strong>${olleSumma}€</strong><br>
		Võlad ${monthNames[new Date().getMonth() - 1]}s puuduvad!<br><br>
		Parimat soovides<br>
		Sinu Õllesüsteem</p>`;
    } else {
	return `<p>Hei Laekur<br><br>
		Rebaste tasuta joodud joogid (õlu/alkovaba) ${monthNames[new Date().getMonth() - 1]}s: <strong>${olleSumma}€</strong><br>
		Manuses on ${monthNames[new Date().getMonth() - 1]} võlglaste väljund.<br><br>
		Parimat soovides<br>
		Sinu Õllesüsteem</p>`;
    }
};

let getMailOptions = (csv, html) => {
    if (csv.length === 0) {
	return {
            from: "ollesusteem@gmail.com",
            to: "palgijoel@gmail.com",
            subject: `Bibendi ${monthNames[new Date().getMonth() - 1]} numbrid`,
            html: html
        };
    } else {
	return {
            from: "ollesusteem@gmail.com",
            to: "palgijoel@gmail.com",
            subject: `Bibendi ${monthNames[new Date().getMonth() - 1]} numbrid`,
            html: html,
	    attachments: [{
    		    filename: 'volglased.csv',
    		    contentType: 'text/csv',
    		    content: csv
  	    }]
        };
    }
};