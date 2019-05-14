var express = require("express"),
    rc522   = require("rc522"),
    middleware = require("../middleware"),
    database = require("../middleware/database"),
    mysql = require("mysql"),
    router  = express.Router(),
    rpio = require('rpio');

router.get("/", function(req, res){
    res.render("home");
});

router.get("/kaart", function(req, res, next){
    rc522.init();
    rc522.read(async function(serial){
	ring();
	rc522.child();
	var sql = mysql.format("SELECT * FROM Kasutaja WHERE kaardi_id =?", [serial]);
    	
	try {
    	    var result = await database.query(sql)
    	} catch(err) {
    	    throw new Error(err)
	    req.flash("ERROR", "Andmebaasist kasutaja saamisega tekkis viga", "/");
    	}

	if (result.length > 0) {
	    if (result[0].kasutaja_seisu_id === 1) {
	    	middleware.addUserCard(serial);
	    	res.redirect("/tooted/" + serial);
	    } else {
		req.flash("ERROR", "Kasutaja ei ole aktiivne!", "/");
	    }
	} else {
	    res.redirect("/registreeri/" + serial);
    	}
    });
});

router.get("/registreeri/:id", function(req, res){
    var id = req.params.id;
    res.render("registreeri", {id: id});
});

router.post("/registreeri/:id", async function(req, res){
    var eesnimi = req.body.eesnimi;
    var perenimi = req.body.perenimi;
    var id = req.params.id;

    var sql = mysql.format("INSERT INTO Kasutaja (kaardi_id, eesnimi, perenimi) VALUES (?, ?, ?)", [id, eesnimi, perenimi]);
    
    console.log("========== LISA UUS KASUTAJA ANDMEBAASI ==========")

    try {
	var result = await database.query(sql);
    } catch(err) {
    	throw new Error(err);
	req.flash("ERROR", "Kasutaja registreerimisega tekkis viga", "/");
    }

    console.log("Affected Rows: "+ result.affectedRows + " | Added: " + eesnimi + " " + perenimi);
    middleware.addUserCard(id);
    res.redirect("/tooted/" + id);
});

module.exports = router;

// =====================================================

function ring() {
    rpio.open(40, rpio.OUTPUT, rpio.HIGH);
    rpio.open(33, rpio.OUTPUT, rpio.HIGH);
    rpio.msleep(50);
    rpio.close(33);
    rpio.close(40);
}
