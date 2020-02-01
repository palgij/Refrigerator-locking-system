let nodemailer	    = require("nodemailer"),
    mysql           = require('mysql'),
    errorCodes      = require("./errorCodes"),
    makeSqlQuery    = require('./sqlFun').makeSqlQuery,
    sqlString       = require('./sqlString');

let userIds = [];
let monthNames = ["Jaanuarikuu", "Veebruarikuu", "Märtsikuu", "Aprillikuu", "Maikuu", "Juunikuu", "Juulikuu", "Augustikuu", "Septembrikuu", "Oktoobrikuu", "Novembrikuu", "Detsembrikuu"];
let needToSendMail = [];

module.exports.userIds = userIds;

// Transporteriks fetchi credentials
let getTransporter = async () => {
    let sql = mysql.format(sqlString.getCredentials, ['email']);
    let credentials = await makeSqlQuery(
    	sql,
    	errorCodes.EMAIL_CREDENTIALS_FAILED.code,
    	errorCodes.EMAIL_CREDENTIALS_FAILED.message,
    	console.log);
    
    return nodemailer.createTransport({
    	service: 'gmail',
    	auth: {
            user: credentials[0].kasutaja_nimi,
            pass: credentials[0].salasona
    	}
    });
}

// Uus kasutaja vajab kinnitamist meil
module.exports.sendMail = (subject, html, id) => {
    needToSendMail.push([subject, html, id, 1]);
    
    let transporter = getTransporter();
    const mailOptions = {
        from: "ollesusteem@gmail.com",
        to: "palgijoel@gmail.com",
        subject: subject,
        html: html
    };
    transporter.sendMail(mailOptions, (err) => {
        let index = needToSendMail.findIndex(elem => elem[1] === mailOptions.html)
        if (err) {
            if (index !== -1 && needToSendMail[index][3] < 3) {
                setTimeout(this.sendMail.bind(null, needToSendMail[index][0], needToSendMail[index][1], needToSendMail[index][2]), 300000);
            }
            
            if (index !== -1 && needToSendMail[index][3]++ > 2) {
                needToSendMail.splice(index, 1);
                console.log("Meili uuesti saatmine lõpetati pärast 3 korda.")
            }
            console.log(errorCodes.MAIL_ERROR.message);
            console.log(`SEND MAILI OMA ERROR:\n${err}\n`);
        } else {
            if (index !== -1) {
                needToSendMail.splice(index, 1);
            }

            console.log("Meili saatmine õnnestus!");
            userIds.push(id);
        }
    });
};

// Kuu lõpu operatsiooni meil
module.exports.bibendileMeil = (csv, olleSumma) => {
    // Tee arrayst tekst fail -> csv
    let html = getHtml(csv, olleSumma);

    let transporter = getTransporter();

    // Meili sisu ja liited
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