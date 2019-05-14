var express = require("express"),
    rc522   = require("rc522"),
    database = require("../middleware/database"),
    middleware = require("../middleware/adminAuth"),
    mysql = require("mysql"),
    router  = express.Router(),
    rpio = require('rpio');

var password = "admin"

router.get("/", middleware.removeIp, function(req, res){
    res.render("admin/home");
});

router.get("/auth", middleware.checkIpSessionValid, function(req, res){

    res.render("admin/auth");
});

router.post("/auth", middleware.checkIpSessionValid, function(req, res){
    if (req.body.password === password){
	res.redirect("/admin/kodu");
    } else {
	req.flash("ERROR", "Vale salasõna", "/admin/auth");
    }
});

router.get("/kodu", middleware.checkIpSessionValid, async function(req, res){
    var ostjad = await getOstjadTop();
    var tooted = await getTootedTop();

    res.render("admin/kodu", {tooted: tooted, ostjad: ostjad})

});

router.get("/kasutajad", middleware.checkIpSessionValid, async function(req, res){
    var kasutajad = await getKasutajad();

    res.render("admin/kasutajad", {kasutajad: kasutajad});
});

router.post("/kasutajad/:id", middleware.checkIpSessionValid, async function(req, res) {
    var volg = parseFloat(req.body.volg).toFixed(2);
    var checkbox = req.body.check;
    var aktiivne
    var admin

    if (checkbox) {
        checkbox.includes("aktiivne") ? aktiivne = 1 : aktiivne = 2;
	checkbox.includes("admin") ?  admin = true : admin = false;
    } else { 
	aktiivne = 2;
 	admin = false;
    }

    var sql = mysql.format("UPDATE Kasutaja SET kasutaja_seisu_id = ?, eesnimi = ?, perenimi = ?, volg = ?, on_admin = ? WHERE kasutaja_id = ?", [aktiivne, req.body.eesnimi, req.body.perenimi, volg, admin, req.params.id]);
    	
    try {
        var result = await database.query(sql)
    } catch(err) {
        throw new Error(err)
        req.flash("ERROR", "Kasutaja andmete uuendamisega tekkis viga", "/admin");
    }

    console.log("========== MUUDA KASUTAJA ANDMEID ==========");
    console.log(result.message);
    res.redirect("/admin/kasutajad");
});

router.get("/kasutajad/muuda/:id", middleware.checkIpSessionValid, async function(req, res){
    var kasutaja = await getKasutaja(req.params.id); 

    res.render("admin/muuda", {kasutaja: kasutaja[0]});
});

router.get("/tooted", middleware.checkIpSessionValid, async function(req, res){
    var joogid = await getJoogid();
    var soogid = await getSoogid();

    res.render("admin/tooted", {joogid: joogid, soogid, soogid});
});

router.post("/tooted/:id", middleware.checkIpSessionValid, async function(req, res){
    var kategooria = parseFloat(req.body.kategooria);
    var kogus = parseFloat(req.body.kogus).toFixed(1);
    var hind = parseFloat(req.body.hind).toFixed(1);

    var sql = mysql.format("UPDATE Toode SET toote_kategooria_id = ?, nimetus = ?, hetke_kogus = ?, hind = ? WHERE toote_id = ?", [kategooria, req.body.nimetus, kogus, hind, req.params.id]);
    	
    try {
        var result = await database.query(sql)
    } catch(err) {
        throw new Error(err)
        req.flash("ERROR", "Toote andmete uuendamisega tekkis viga", "/admin");
    }

    console.log("========== MUUDA TOOTE ANDMEID ==========");
    console.log(result.message);
    res.redirect("/admin/tooted");
});

router.get("/tooted/muuda/:id", middleware.checkIpSessionValid, async function(req, res){
    var toode = await getToode(req.params.id);

    res.render("admin/muudaToode", {toode: toode[0]});
});

router.get("/tooted/uus", middleware.checkIpSessionValid, function(req, res){

    res.render("admin/uusToode");
});

router.post("/tooted", middleware.checkIpSessionValid, async function(req, res){
    var kategooria = parseFloat(req.body.kategooria);
    var kogus = parseFloat(req.body.kogus).toFixed(1);
    var hind = parseFloat(req.body.hind).toFixed(1);

    var sql = mysql.format("INSERT INTO Toode (toote_kategooria_id, nimetus, hetke_kogus, hind) VALUES (?, ?, ?, ?)", [kategooria, req.body.nimetus, kogus, hind]);
    console.log("========== LISA TOODE ANDMEBAASI ==========");	
    try {
        var result = await database.query(sql)
    } catch(err) {
        throw new Error(err)
        req.flash("ERROR", "Toote andmete uuendamisega tekkis viga", "/admin");
    }
    console.log("Uus toode lisatud: ");
    console.log("kategooria - " + kategooria);
    console.log("kogus - " + kogus);
    console.log("hind - " + hind);
    console.log("nimetus - " + req.body.nimetus);

    res.redirect("/admin/tooted");
});

router.get("/ostud", middleware.checkIpSessionValid, async function(req, res){
    var ostud = await getOstud();

    res.render("admin/ostudeNimekiri", {ostud: ostud});
});

router.get("/kaartAdmin", function(req, res){
    rc522.init();
    rc522.read(async function(serial){
	ring();
   	rc522.child();
	var sql = mysql.format("SELECT * FROM Kasutaja WHERE kaardi_id =?", [serial]);
    	
	try {
    	    var result = await database.query(sql)
    	} catch(err) {
    	    throw new Error(err)
	    req.flash("ERROR", "Andmebaasist kasutaja saamisega tekkis viga", "/admin");
    	}

	if (result.length > 0) {
	    if (result[0].on_admin == 1) {
		middleware.addIp(req.clientIp);
		res.redirect("/admin/auth");
	    } else {
		req.flash("ERROR", "Selle kaardiga siia ei pääse :)", "/admin");
	    }
    	} else {
	    req.flash("ERROR", "Selle kaardiga siia ei pääse :)", "/admin");
    	}
    });
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

async function getOstjadTop() {
    var sql = "SELECT eesnimi, perenimi, volg FROM Kasutaja ORDER BY volg DESC LIMIT 10";
    	
    try {
	var result = await database.query(sql)
    } catch(err) {
	throw new Error(err)
	req.flash("ERROR", "Andmebaasist kasutajate saamisega tekkis viga", "/admin");
    }
    return result;
}

async function getTootedTop() {
    var sql = "SELECT Toode.nimetus, COUNT(Toode.nimetus) AS arv FROM Ost INNER JOIN Toode ON Toode.toote_id = Ost.toote_id WHERE Ost.aeg BETWEEN DATE_SUB(NOW(), INTERVAL 90 DAY) AND NOW() GROUP BY Toode.nimetus ORDER BY COUNT(Toode.nimetus) DESC, Toode.nimetus LIMIT 10";
    	
    try {
	var result = await database.query(sql)
    } catch(err) {
	throw new Error(err)
	req.flash("ERROR", "Andmebaasist toodete saamisega tekkis viga", "/admin");
    }
    return result;
}

async function getKasutajad() {
    var sql = "SELECT kasutaja_id, Kasutaja.kasutaja_seisu_id, eesnimi, perenimi, volg, on_admin, nimetus FROM Kasutaja INNER JOIN Kasutaja_Seis ON Kasutaja.kasutaja_seisu_id = Kasutaja_Seis.kasutaja_seisu_id ORDER BY perenimi, eesnimi";
    	
    try {
	var result = await database.query(sql)
    } catch(err) {
	throw new Error(err)
	req.flash("ERROR", "Andmebaasist kasutajate saamisega tekkis viga", "/admin");
    }
    return result;
}

async function getKasutaja(id) {
    var sql = mysql.format("SELECT * FROM Kasutaja INNER JOIN Kasutaja_Seis ON Kasutaja.kasutaja_seisu_id = Kasutaja_Seis.kasutaja_seisu_id WHERE kasutaja_id =?", [id]);
    	
    try {
	var result = await database.query(sql)
    } catch(err) {
	throw new Error(err)
	req.flash("ERROR", "Andmebaasist kasutaja saamisega tekkis viga", "/admin");
    }
    return result;
}

async function getToode(id) {
    var sql = mysql.format("SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toode.toote_id = ?", [id]);
    	
    try {
	var result = await database.query(sql)
    } catch(err) {
	throw new Error(err)
	req.flash("ERROR", "Andmebaasist toote saamisega tekkis viga", "/admin");
    }
    return result;
}

async function getJoogid() {
    var sql = "SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toote_Kategooria.toote_kategooria_klassi_id = 1 ORDER BY Toode.toote_kategooria_id, Toode.nimetus";

    try {
	var result = await database.query(sql)
    } catch(err) {
	throw new Error(err)
	req.flash("ERROR", "Andmebaasist jookide saamisega tekkis viga", "/admin");
    }
    return result;
}

async function getSoogid() {
    var sql = "SELECT * FROM (Toode INNER JOIN Toote_Kategooria ON Toode.toote_kategooria_id = Toote_Kategooria.toote_kategooria_id) INNER JOIN Toote_Kategooria_Klass ON Toote_Kategooria.toote_kategooria_klassi_id = Toote_Kategooria_Klass.toote_kategooria_klassi_id WHERE Toote_Kategooria.toote_kategooria_klassi_id = 2 ORDER BY Toode.toote_kategooria_id, Toode.nimetus";

    try {
	var result = await database.query(sql)
    } catch(err) {
	throw new Error(err)
	req.flash("ERROR", "Andmebaasist söökide saamisega tekkis viga", "/admin");
    }
    return result;
}

async function getOstud() {
    var sql = mysql.format("SELECT DATE_FORMAT(aeg, '%d.%m.%Y %H:%i') aeg, CONCAT(eesnimi,' ', perenimi) AS nimi, nimetus, kogus, summa FROM Ost INNER JOIN Kasutaja ON Kasutaja.kasutaja_id = Ost.ostja_id INNER JOIN Toode ON Toode.toote_id = Ost.toote_id ORDER BY DATE(aeg) DESC");

    try {
	var result = await database.query(sql)
    } catch(err) {
	throw new Error(err)
	req.flash("ERROR", "Andmebaasist söökide saamisega tekkis viga", "/admin");
    }
    return result;
}
