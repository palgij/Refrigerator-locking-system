var rpio       = require("rpio"),
    express    = require("express"),
    middleware = require("../middleware"),
    database   = require("../middleware/database"),
    mysql      = require("mysql"),
    router     = express.Router({mergeParams: true});

router.get("/", middleware.checkUserSessionValid, async function(req, res) {
    var id = req.params.id;

    var sql1 = "SELECT * FROM Toode WHERE toote_kategooria_id = 1";
    var sql2 = "SELECT * FROM Toode WHERE toote_kategooria_id = 2";
    var sql3 = "SELECT * FROM Toode WHERE toote_kategooria_id = 3";
    var sql4 = "SELECT * FROM Toode WHERE toote_kategooria_id = 4";
    var sql5 = "SELECT * FROM Toode WHERE toote_kategooria_id = 5";
    var sql6 = "SELECT * FROM Toode WHERE toote_kategooria_id = 6";
    var sql7 = mysql.format("SELECT eesnimi, perenimi FROM Kasutaja WHERE kaardi_id =?", [id]);
    
    try {
 	var jook1 = await database.query(sql1);
 	var jook2 = await database.query(sql2);
 	var jook3 = await database.query(sql3);
 	var jook4 = await database.query(sql4);
 	var sook5 = await database.query(sql5);
	var sook6 = await database.query(sql6);
	var kasutaja = await database.query(sql7);
    } catch(err) {
    	throw new Error(err)
	req.flash("ERROR", "Andmebaasist toodete saamisega tekkis viga", "/");
    }
    var nimi = kasutaja[0].eesnimi + " " + kasutaja[0].perenimi;

    middleware.getUsers(id).nimi = nimi;

    res.render("tooted", {id: id, jook1: jook1, jook2: jook2, jook3: jook3, jook4: jook4,
				sook5: sook5, sook6: sook6, nimi: nimi});
});

router.get("/:toode/", middleware.checkUserSessionValid, async function(req, res) {
    var toode = req.params.toode;
    var id = req.params.id;
   
    var sql = mysql.format("SELECT hind FROM Toode WHERE nimetus =?", [toode]);
    try {

	var hind = await database.query(sql);

    } catch(err) {
    	throw new Error(err)
	req.flash("ERROR", "Kasutaja ja hinna saamisega andmebaasist tekkis viga", "/");
    }   

    var nimi = middleware.getUsers(id).nimi;
    middleware.getUsers(id).hind = hind[0].hind;

    res.render("kogus", {id: id, toode: toode, hind: hind[0].hind, nimi: nimi});
});

// Kas siin hoida seda checki? :S vb tekitab ebamugavusi
router.post("/:toode", middleware.checkUserSessionValid, async function(req, res, next){
    var toode = req.params.toode;
    var id = req.params.id;
    var kogus = parseFloat(req.body.kogus);
    var hind = middleware.getUsers(id).hind	
    var summa = hind * kogus;

    var sql1 = mysql.format("SELECT volg FROM Kasutaja WHERE kaardi_id =?", [id]);
    var sql3 = mysql.format("SELECT hetke_kogus FROM Toode WHERE nimetus =?", [toode]);
    var sql4 = mysql.format("SELECT kasutaja_id FROM Kasutaja WHERE kaardi_id =?", [id]);
    var sql5 = mysql.format("SELECT toote_id FROM Toode WHERE nimetus =?", [toode]);

    try {
	console.log("========== LISA SUMMA KASUTAJA VÕLGA ==========");
	var result = await database.query(sql1);
	console.log("Kogus: " + kogus + " | hind: " + hind + "  |  " + kogus * hind);
	console.log("Võlg enne: " + parseFloat(result[0].volg));
	var total = parseFloat(result[0].volg) + kogus * hind;
	console.log("Võlg uus: " + total);

	var sql2 = mysql.format("UPDATE Kasutaja SET volg =? WHERE kaardi_id =?", [total, id]);
	var update = await database.query(sql2);
 	console.log(update.message);

	console.log("========== MUUDA TOOTE KOGUST ==========");
	result = await database.query(sql3);
	total = parseFloat(result[0].hetke_kogus) - kogus;
	console.log("Vana kogus: " + result[0].hetke_kogus + " | Uus kogus: " + total);

	sql2 = mysql.format("UPDATE Toode SET hetke_kogus =? WHERE nimetus =?", [total, toode]);
	update = await database.query(sql2);
	console.log(update.message);

	console.log("========== LISA OST ANDMEBAASI ==========");
	result = await database.query(sql4);
	var ostja_id = parseInt(result[0].kasutaja_id, 10);
	result = await database.query(sql5);
	var toote_id = parseInt(result[0].toote_id, 10);
	console.log("Toode: " + toote_id + " | Ostja: " + ostja_id);
	sql2 = mysql.format("INSERT INTO Ost (ostja_id, toote_id, kogus, summa) VALUES (?, ?, ?, ?)", [ostja_id, toote_id, kogus, summa]);
	result = await database.query(sql2);
	console.log(update.message);

    } catch(err) {
    	throw new Error(err)
	req.flash("ERROR", "Ostu sooritamisega tekkis viga", "/");
    }  

    // AVA LUKK JA SUUNA KASUTAJA KODUKALE
    lockOpen();
    middleware.removeUser(id);
    req.flash("SUCCESS", "Kapp on avatud 10s", "/");
});

// ==================================================

function lockOpen() {
    rpio.open(7, rpio.OUTPUT, rpio.LOW);

    setTimeout(function () {
  	rpio.close(7);
    }, 10000);	
}

module.exports = router;