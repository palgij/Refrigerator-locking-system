let rpio       = require("../middleware/gpio"),
    express    = require("express"),
    middleware = require("../middleware/regularAuth"),
    database   = require("../middleware/database"),
    mysql      = require("mysql"),
    sqlString  = require("../middleware/sqlString"),
    router     = express.Router({mergeParams: true});

router.get("/", middleware.checkUserSessionValid, async (req, res) => {
    let id = req.params.id;
    let sql7 = mysql.format(sqlString.kasutaja_seisID, [id]);

    try {
        var jook1 = await database.query(sqlString.toode1);
        var jook2 = await database.query(sqlString.toode2);
        var jook3 = await database.query(sqlString.toode3);
        var jook4 = await database.query(sqlString.toode4);
        var sook5 = await database.query(sqlString.toode5);
        var sook6 = await database.query(sqlString.toode6);
        var kasutaja = await database.query(sql7);
    } catch(err) {
        req.flash("ERROR", "Andmebaasist toodete saamisega tekkis viga", "/");
    	throw new Error(err);
    }
    let nimi = kasutaja[0].nimetus + " " + kasutaja[0].eesnimi + " " + kasutaja[0].perenimi;
    middleware.getUsers(id).nimi = nimi;
    res.render("tooted", {id: id, jook1: jook1, jook2: jook2, jook3: jook3, jook4: jook4,
				sook5: sook5, sook6: sook6, nimi: nimi, seis: kasutaja[0].kasutaja_seisu_id});
});

router.get("/:toode/", middleware.checkUserSessionValid, async (req, res) => {
    let toode = req.params.toode;
    let id = req.params.id;
    let sql = mysql.format(sqlString.myygiHindNIMETUS, [toode]);

    try {
	    var hind = await database.query(sql);
    } catch(err) {
        req.flash("ERROR", "Hinna saamisega andmebaasist tekkis viga", "/");
    	throw new Error(err);
    }
    let nimi = middleware.getUsers(id).nimi;
    middleware.getUsers(id).hind = hind[0].myygi_hind;
    res.render("kogus", {id: id, toode: toode, hind: hind[0].myygi_hind, nimi: nimi});
});

router.post("/:toode", middleware.checkUserSessionValid, async (req) => {
    let toode = req.params.toode;
    let id = req.params.id;
    let kogus = parseFloat(req.body.kogus);
    let hind = middleware.getUsers(id).hind;
    let summa = hind * kogus;
    let nimi = middleware.getUsers(id).nimi;
    let tasuta = false;
    let volg;
    let sql1 = mysql.format(sqlString.volgStaatusID, [id]);
    let sql3 = mysql.format("SELECT toote_kategooria_id FROM Toode WHERE nimetus = ?", [toode]);

    try {
	let result = await database.query(sql3);
	let kategooria = result[0].toote_kategooria_id;
	sql3 = mysql.format(sqlString.hetke_kogusNIMETUS, [toode]);
        console.log("========== LISA SUMMA KASUTAJA VÕLGA ==========");
        result = await database.query(sql1);
        console.log("Kogus: " + kogus + " | hind: " + hind + "  |  kokku: " + summa + " | (1 == reb!) " + result[0].kasutaja_staatuse_id);
        console.log("Võlg enne: " + parseFloat(result[0].volg));
        volg = parseFloat(result[0].volg);
        if (result[0].kasutaja_staatuse_id === 1 && (kategooria === 1 || kategooria === 2)) {
            tasuta = true;
            console.log("Võlg uus: " + volg + " !reb");
        } else {
	    volg += summa;
            console.log("Võlg uus: " + volg);
            sql1 = mysql.format(sqlString.updateVolgID, [volg, id]);
            var update = await database.query(sql1);
            console.log(update.message);
        }

        console.log("========== MUUDA TOOTE KOGUST ==========");
        result = await database.query(sql3);
        let total = parseFloat(result[0].hetke_kogus) - kogus;
        console.log("Vana kogus: " + result[0].hetke_kogus + " | Uus kogus: " + total);

        sql1 = mysql.format(sqlString.updateKogusNIMETUS, [total, toode]);
        update = await database.query(sql1);
        console.log(update.message);

        console.log("========== LISA OST ANDMEBAASI ==========");
        console.log("Toode: " + toode + " | Ostja: " + nimi);
        sql1 = mysql.format(sqlString.lisaOst, [nimi, toode, kogus, summa, tasuta]);
        result = await database.query(sql1);
        console.log(result.message);
    } catch(err) {
        req.flash("ERROR", "Ostu sooritamisega tekkis viga", "/");
    	throw new Error(err);
    }
    rpio.lockOpen();
    middleware.removeUser(id);
    req.flash("SUCCESS", "Kapp on avatud 10s", "/");
});

module.exports = router;