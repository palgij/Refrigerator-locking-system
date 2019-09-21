let express     = require("express"),
    rc522       = require("rc522"),
    middleware  = require("../middleware/regularAuth"),
    database    = require("../middleware/database"),
    sqlString   = require("../middleware/sqlString"),
    mysql       = require("mysql"),
    buzzer      = require("../middleware/gpio"),
    email	= require("../middleware/sendMail"),
    router      = express.Router();

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/kaart", (req, res) => {
    rc522.init();
    rc522.read(async (serial) => {       
	buzzer.ring();
        rc522.child();
        let sql = mysql.format(sqlString.kasutajaSeisKinn, [serial]);

        try {
            var result = await database.query(sql)
        } catch(err) {
            req.flash("ERROR", "Andmebaasist kasutaja saamisega tekkis viga", "/");
            throw new Error(err);
        }
        if (result.length > 0) {
            if (result[0].admin_on_kinnitanud === 1 && (result[0].kasutaja_seisu_id === 1 || result[0].kasutaja_seisu_id === 2)) {
                middleware.addUserCard(serial);
                res.redirect("/tooted/" + serial);
            } else {
                if (result[0].admin_on_kinnitanud === 0)
		    req.flash("ERROR", "Bibendi ei ole sind kinnitanud! Võta Bibendiga ühendust.", "/");
		else
		    req.flash("ERROR", "Väljalangenu!", "/");
            }
        } else {
            res.redirect("/registreeri/" + serial);
        }
    });
});

router.get("/registreeri/:id", (req, res) => {
    let id = req.params.id;
    res.render("registreeri", {id: id});
});

router.post("/kinnitaKasutaja/:id", async (req, res) => {
    let id = req.params.id;
    let sql = mysql.format("UPDATE Kasutaja SET admin_on_kinnitanud = 1 WHERE kaardi_id = ?", [id]);
    try {
        await database.query(sql);
    } catch(err) {
        req.flash("ERROR", "Andmebaasist kasutaja muutmisega tekkis viga", "/");
        throw new Error(err);
    }
    console.log("Kasutaja kinnitatud, kaardiId: " + id);
    req.flash("SUCCESS", "Kasutaja on kinnitatud!", "/");
});

router.post("/registreeri/:id", async (req, res) => {
    let eesnimi = req.body.eesnimi;
    let perenimi = req.body.perenimi;
    let staatuse_id = parseFloat(req.body.staatuse_id);
    let coetus = req.body.coetus;
    let id = req.params.id;
    let sql = mysql.format(sqlString.insertKasutaja, [staatuse_id, id, eesnimi, perenimi, coetus]);

    console.log("========== LISA UUS KASUTAJA ANDMEBAASI ==========");
    try {
	var result = await database.query(sql);
    } catch(err) {
        req.flash("ERROR", "Kasutaja registreerimisega tekkis viga", "/");
    	throw new Error(err);
    }
    console.log("Affected Rows: "+ result.affectedRows + " | Added: " + eesnimi + " " + perenimi + " " + staatuse_id + " " + coetus);
    middleware.addUserCard(id);

    // Anna bibendile teada uue kasutaja registreerimisest
    let nimi = "Nimi - " + eesnimi + " " + perenimi;
    let staatus = "Staatus (1-reb!, 2-sv!, 3-b!vil!, 4-vil!) - " + staatuse_id;
    let coetusTxt = "Coetus - " + coetus;
    let link = "http://192.168.1.243:3000/kinnitaKasutaja/" + id;
    let html = '<h1>Uus kasutaja vajab kinnitamist!</h1><ul><li>' + nimi + '</li><li>' + staatus + '</li>' + 
	'<li>' + coetusTxt + '</li></ul><form action=' + link + ' method="POST">' + 
	'<button type="submit">Kinnita kasutaja, vajuta siia</button></form>';
    await email.sendMail("Uus Kasutaja registreeris", req, html); 
});

module.exports = router;
