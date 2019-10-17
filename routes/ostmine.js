let rpio       = require("../middleware/gpio"),
    express    = require("express"),
    middleware = require("../middleware/regularAuth"),
    mysql      = require("mysql"),
    sqlString  = require("../middleware/sqlString"),
    sqlFun     = require("../middleware/sqlFun"),
    router     = express.Router({mergeParams: true});

router.get("/", middleware.checkUserSessionValid, async (req, res) => {
    let id = req.params.id;
    let sql7;
    if (id.includes('"')) {
	let arr = id.split('"');
	// rebase id
	id = arr[0]
	middleware.getUsers(id).newId = arr[1];
    	sql7 = mysql.format(sqlString.kasutaja_seisID, [arr[1]]);
	middleware.getUsers(id).reb = true;
    } else sql7 = mysql.format(sqlString.kasutaja_seisID, [id]);

    let jook1 = await sqlFun.makeSqlQuery(sqlString.toode1, "/", "Andmebaasist toodete saamisega tekkis viga", req);
    let jook2 = await sqlFun.makeSqlQuery(sqlString.toode2, "/", "Andmebaasist toodete saamisega tekkis viga", req);
    let jook3 = await sqlFun.makeSqlQuery(sqlString.toode3, "/", "Andmebaasist toodete saamisega tekkis viga", req);
    let jook4 = await sqlFun.makeSqlQuery(sqlString.toode4, "/", "Andmebaasist toodete saamisega tekkis viga", req);
    let sook5 = await sqlFun.makeSqlQuery(sqlString.toode5, "/", "Andmebaasist toodete saamisega tekkis viga", req);
    let sook6 = await sqlFun.makeSqlQuery(sqlString.toode6, "/", "Andmebaasist toodete saamisega tekkis viga", req);
    let kasutaja = await sqlFun.makeSqlQuery(sql7, "/", "Andmebaasist kasutaja saamisega tekkis viga", req);

    let nimi = kasutaja[0].nimetus + " " + kasutaja[0].eesnimi + " " + kasutaja[0].perenimi;
    middleware.getUsers(id).nimi = nimi; 
    res.render("tooted", {id: id, reb: middleware.getUsers(id).reb, jook1: jook1, jook2: jook2, jook3: jook3, jook4: jook4,
				sook5: sook5, sook6: sook6, nimi: nimi, seis: kasutaja[0].kasutaja_seisu_id});
});

router.get("/paneKirja", middleware.checkUserSessionValid, async (req, res) => {
    let id = req.params.id;  
    let sql = mysql.format(sqlString.kasutajadPaneKirja, [id]);
    let kasutajad = await sqlFun.makeSqlQuery(sql, "/", "Andmebaasist kasutajate saamisega tekkis viga", req);
    sql = mysql.format(sqlString.viimase12hKasutajad, [id]);
    let viimased12hKasutajad = await sqlFun.makeSqlQuery(sql, "/", "Andmebaasist viimase 12h kasutajate saamisega tekkis viga", req);

    let uusKasutajad = [];
    let arrCoetus = [];
    let str = "";
    let num = -1;
    kasutajad.forEach((kasutaja) => {
	if (str !== kasutaja.coetus) {
	    str = kasutaja.coetus;
	    num++;
	    uusKasutajad.push([]);
	}
	uusKasutajad[num].push(kasutaja);
    });

    res.render("paneKirja", {kasutajad: uusKasutajad, rebId: id, viimane12h: viimased12hKasutajad});
});

router.get("/:toode/", middleware.checkUserSessionValid, async (req, res) => {
    let toode = req.params.toode;
    let id = req.params.id;
    let sql = mysql.format(sqlString.myygiHindNIMETUS, [toode]);

    let hind = await sqlFun.makeSqlQuery(sql, "/", "Hinna saamisega andmebaasist tekkis viga", req);
    let nimi = middleware.getUsers(id).nimi;
    middleware.getUsers(id).hind = hind[0].myygi_hind;
    res.render("kogus", {id: id, reb: middleware.getUsers(id).reb, newId: middleware.getUsers(id).newId, toode: toode, 
				hind: hind[0].myygi_hind, nimi: nimi});
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
    let sql1;
    if (middleware.getUsers(id).reb) sql1 = mysql.format(sqlString.volgStaatusID, [middleware.getUsers(id).newId]);
    else sql1 = mysql.format(sqlString.volgStaatusID, [id]);
    let sql3 = mysql.format(sqlString.tooteKategooriaID, [toode]);

    let result = await sqlFun.makeSqlQuery(sql3, "/", "Ostu sooritamisega tekkis viga", req);
    let kategooria = result[0].toote_kategooria_id;
    sql3 = mysql.format(sqlString.hetke_kogusNIMETUS, [toode]);
    console.log("========== LISA SUMMA KASUTAJA VÕLGA ==========");

    result = await sqlFun.makeSqlQuery(sql1, "/", "Ostu sooritamisega tekkis viga", req);
    console.log(`Kogus: ${kogus} | hind: ${hind} | kokku: ${summa} | (1 == reb!) ${result[0].kasutaja_staatuse_id}`);
    console.log(`Võlg enne: ${parseFloat(result[0].volg)}`);
    volg = parseFloat(result[0].volg);
    if (result[0].kasutaja_staatuse_id === 1 && (kategooria === 1 || kategooria === 2)) {
        tasuta = true;
        console.log("Võlg sama mis enne - !reb");
    } else {
        volg += summa;
        console.log(`Võlg uus: ${volg}`);
    	if (middleware.getUsers(id).reb) sql1 = mysql.format(sqlString.updateVolgID, [volg, middleware.getUsers(id).newId]);
        else sql1 = mysql.format(sqlString.updateVolgID, [volg, id]);
        await sqlFun.makeSqlQuery(sql1, "/", "Ostu sooritamisega tekkis viga", req);
    }

    console.log("========== MUUDA TOOTE KOGUST ==========");
    result = await sqlFun.makeSqlQuery(sql3, "/", "Ostu sooritamisega tekkis viga", req);
    let total = parseFloat(result[0].hetke_kogus) - kogus;
    console.log(`Vana kogus: ${result[0].hetke_kogus} | Uus kogus: ${total}`);

    sql1 = mysql.format(sqlString.updateKogusNIMETUS, [total, toode]);
    await sqlFun.makeSqlQuery(sql1, "/", "Ostu sooritamisega tekkis viga", req);

    console.log("========== LISA OST ANDMEBAASI ==========");
    if (middleware.getUsers(id).reb) console.log(`Toode: ${toode} | Ostja: reb! -> ${nimi}`);
    else console.log(`Toode: ${toode} | Ostja: ${nimi}`);

    sql1 = mysql.format(sqlString.lisaOst, [nimi, toode, kogus, summa, tasuta, !!middleware.getUsers(id).reb]);
    await sqlFun.makeSqlQuery(sql1, "/", "Ostu sooritamisega tekkis viga", req);
    rpio.lockOpen();
    middleware.removeUser(id);
    req.flash("SUCCESS", "Kapp on avatud 10s", "/");
});

module.exports = router;