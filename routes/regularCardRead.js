let express     = require("express"),
    rc522       = require("rc522"),
    middleware  = require("../middleware/regularAuth"),
    database    = require("../middleware/database"),
    sqlString   = require("../middleware/sqlString"),
    mysql       = require("mysql"),
    buzzer      = require("../middleware/gpio"),
    router      = express.Router();

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/kaart", (req, res) => {
    rc522.init();
    rc522.read(async (serial) => {       
	buzzer.ring();
        rc522.child();
        let sql = mysql.format(sqlString.kasutajaSeis, [serial]);

        try {
            var result = await database.query(sql)
        } catch(err) {
            req.flash("ERROR", "Andmebaasist kasutaja saamisega tekkis viga", "/");
            throw new Error(err);
        }
        if (result.length > 0) {
            if (result[0].kasutaja_seisu_id === 1 || result[0].kasutaja_seisu_id === 2) {
                middleware.addUserCard(serial);
                res.redirect("/tooted/" + serial);
            } else {
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
    res.redirect("/tooted/" + id);
});

module.exports = router;
