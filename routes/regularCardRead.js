let express     = require("express"),
    rc522       = require("rc522"),
    middleware  = require("../middleware/regularAuth"),
    sqlFun      = require("../middleware/sqlFun"),
    sqlString   = require("../middleware/sqlString"),
    mysql       = require("mysql"),
    buzzer      = require("../middleware/gpio"),
    email       = require("../middleware/sendMail"),
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

        let result = await sqlFun.makeSqlQuery(sql, "/", "Andmebaasist kasutaja saamisega tekkis viga", req);
        if (result.length > 0) {
            if (result[0].admin_on_kinnitanud === 1 && (result[0].kasutaja_seisu_id === 1 || result[0].kasutaja_seisu_id === 2)) {
                middleware.addUserCard(serial);
                res.redirect("/tooted/" + serial);
            } else {
                if (result[0].admin_on_kinnitanud === 0)
		    req.flash("WARN", "Bibendi ei ole sind kinnitanud! Võta Bibendiga ühendust.", "/");
		else
		    req.flash("WARN", "Väljalangenu!", "/");
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

router.post("/kinnitaKasutaja/:id", async (req) => {
    let id = req.params.id;
    let sql = mysql.format(sqlString.updateKinnitatudKAARDIID, [id]);

    await sqlFun.makeSqlQuery(sql, "/", "Kasutaja uuendamisega tekkis viga", req);
    console.log(`========== KASUTAJA KINNITATUD ==========\nkaardi Id: ${id}`);

    sql = mysql.format(sqlString.kasutajaInfID, [id]);
    let kasutaja = await sqlFun.makeSqlQuery(sql, "/", "Kasutaja nime saamisega tekkis viga", req);

    sql = mysql.format(sqlString.insertKasutajaMuutus, [`${kasutaja[0].nimetus} ${kasutaja[0].eesnimi} ${kasutaja[0].perenimi}`, "muutmine", "kinnitanud"]);
    await sqlFun.makeSqlQuery(sql, "/admin", "Kasutajate muutuste tabelisse lisamine ebaõnnestus", req);

    req.flash("SUCCESS2", "Kasutaja on kinnitatud!", "/");
});

router.post("/registreeri/:id", async (req) => {
    let eesnimi = req.body.eesnimi;
    let perenimi = req.body.perenimi;
    let staatuse_id = parseFloat(req.body.staatuse_id);
    let coetus = req.body.coetus;
    let id = req.params.id;
    let sql = mysql.format(sqlString.insertKasutaja, [staatuse_id, id, eesnimi, perenimi, coetus]);

    console.log("========== LISA UUS KASUTAJA ANDMEBAASI ==========");
    await sqlFun.makeSqlQuery(sql, "/", "Kasutaja registreerimisega tekkis viga", req);
    console.log(`Lisatud: ${eesnimi} ${perenimi} ${staatuse_id} ${coetus}`);
    middleware.addUserCard(id);

    sql = mysql.format(sqlString.staatusNimetusID, [staatuse_id]);
    let staatus1 = await sqlFun.makeSqlQuery(sql, "/", "Kasutaja staatuse saamisega tekkis viga", req);

    sql = mysql.format(sqlString.insertKasutajaMuutus, [`${staatus1[0].nimetus} ${eesnimi} ${perenimi}`, "lisamine", "kõik"]);
    await sqlFun.makeSqlQuery(sql, "/admin", "Kasutajate muutuste tabelisse lisamine ebaõnnestus", req);

    // Anna bibendile teada uue kasutaja registreerimisest
    let nimi = `Nimi ${eesnimi} ${perenimi}`;
    let staatus = `Staatus ${staatus1[0].nimetus}`;
    let coetusTxt = `Coetus - ${coetus}`;
    let link = `http://192.168.1.243:3000/kinnitaKasutaja/${id}`;
    let html = `<p><h1>Uus kasutaja vajab kinnitamist!</h1><ul><li>${nimi}</li><li>${staatus}</li><li>${coetusTxt}</li>
    </ul><form action="${link}" method="POST"><button type="submit">Kinnita kasutaja, vajuta siia</button></form></p>`;
    await email.sendMail("Uus Kasutaja registreeris ennast süsteemi", req, html);
});

module.exports = router;
