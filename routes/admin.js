let express     = require("express"),
    middleware  = require("../middleware/adminAuth"),
    sqlFun      = require("../middleware/sqlFun"),
    sqlString   = require("../middleware/sqlString"),
    mysql       = require("mysql"),
    stringify   = require("csv-stringify"),
    gpio        = require("../middleware/gpio"),
    router      = express.Router();

let password = "admin";
let ostudeArv;
let muutusteArvKasutajad;
let muutusteArvLadu;
let lockOpen = false;

router.get("/", middleware.removeIp, (req, res) => {
    res.render("admin/adminSplash");
});

router.post("/", (req, res) => {
    if (req.body.password === password) {
        middleware.addIp(req.clientIp);
	    res.redirect("/admin/kodu");
    } else {
	    req.flash("ERROR", "Vale salasõna", "/admin");
    }
});

router.get("/toggleLukk", middleware.checkIpSessionValid, (req, res) => {
    // TODO tee loogika uuesti kui läheb päriselt laivi!
    gpio.toggleLock();
    lockOpen = !lockOpen;
    let split = req.headers.referer.split("3000")[1];
    res.redirect(split);
});

router.get("/kodu", middleware.checkIpSessionValid, async (req, res) => {
    let ostjad = await sqlFun.getOstjadTop(req);
    let tooted = await sqlFun.getTootedTop(req);
    res.render("admin/kodu", {tooted: tooted, ostjad: ostjad, lockOpen: lockOpen})
});

router.get("/kasutajad", middleware.checkIpSessionValid, async (req, res) => {
    let kasutajad = await sqlFun.getKasutajad(req);
    res.render("admin/kasutajad", {kasutajad: kasutajad, lockOpen: lockOpen});
});

router.post("/kasutajad", middleware.checkIpSessionValid, async (req, res) => {
    await sqlFun.nulliVolad(req);
    let sql = mysql.format(sqlString.insertKasutajaMuutus, ["Kõik kasutajad", "võlgade nullimine", "võlg"]);
    await sqlFun.makeSqlQuery(sql, "/admin", "Kasutajate muutuste tabelisse lisamine ebaõnnestus", req);
    res.redirect("/admin/kasutajad");
});

router.post("/kasutajad/:id", middleware.checkIpSessionValid, async (req, res) => {
    let kasutaja = await sqlFun.getKasutaja(req.params.id, req);
    let arr = [];

    let volg = parseFloat(req.body.volg).toFixed(2);
    let checkbox = req.body.check;
    let kinnitatud;
    let seisus = parseFloat(req.body.seis);
    let staatus = parseFloat(req.body.staatus);
    kinnitatud = !!checkbox;
    let sql = mysql.format(sqlString.updateKasutaja, [seisus, staatus, req.body.eesnimi, req.body.perenimi, volg, kinnitatud, req.params.id]);
    await sqlFun.makeSqlQuery(sql, "/admin", "Kasutaja andmete uuendamisega tekkis viga", req);

    if (seisus !== kasutaja[0].kasutaja_seisu_id) arr.push("seisus");
    if (staatus !== kasutaja[0].kasutaja_staatuse_id) arr.push("staatus");
    if (req.body.eesnimi !== kasutaja[0].eesnimi) arr.push("eesnimi");
    if (req.body.perenimi !== kasutaja[0].perenimi) arr.push("perenimi");
    if (volg !== parseFloat(kasutaja[0].volg).toFixed(2)) arr.push("volg");
    if (kinnitatud != kasutaja[0].admin_on_kinnitanud) arr.push("kinnitanud");

    if (arr.length !== 0 && arr.length !== undefined) {
    	sql = mysql.format(sqlString.staatusNimetusID, [staatus]);
    	var nim = await sqlFun.makeSqlQuery(sql, "/admin", "Staatuse saamisega tekkis viga", req);
    	sql = mysql.format(sqlString.insertKasutajaMuutus, [`${nim[0].nimetus} ${req.body.eesnimi} ${req.body.perenimi}`, "muutmine", arr.join(", ")]);
    	await sqlFun.makeSqlQuery(sql, "/admin", "Kasutajate muutuste tabelisse lisamine ebaõnnestus", req);
	console.log(`========== ${nim[0].nimetus} ${req.body.eesnimi} ${req.body.perenimi} andmeid muudetud ==========`);
    }
    res.redirect("/admin/kasutajad");
});

router.get("/kasutajad/muuda/:id", middleware.checkIpSessionValid, async (req, res) => {
    let kasutaja = await sqlFun.getKasutaja(req.params.id, req);
    res.render("admin/muuda", {kasutaja: kasutaja[0], lockOpen: lockOpen});
});

router.post("/kasutajad/:id/kustuta", middleware.checkIpSessionValid, async (req, res) => {
    let sql = mysql.format(sqlString.kasutajaNimiID, [req.params.id]);
    let kasutaja = await sqlFun.makeSqlQuery(sql, "/admin", "Kasutaja saamisega tekkis viga", req);
    let nimi = kasutaja[0].nimetus + " " + kasutaja[0].eesnimi + " " + kasutaja[0].perenimi;

    await sqlFun.deleteKasutaja(req);

    sql = mysql.format(sqlString.insertKasutajaMuutus, [nimi, "kustutamine", "kõik"]);
    await sqlFun.makeSqlQuery(sql, "/admin", "Kasutajate muutuste tabelisse lisamine ebaõnnestus", req);
    res.redirect("/admin/kasutajad");
});

router.get("/tooted", middleware.checkIpSessionValid, async (req, res) => {
    let joogid = await sqlFun.getJoogid(req);
    let soogid = await sqlFun.getSoogid(req);
    res.render("admin/tooted", {joogid: joogid, soogid: soogid, lockOpen: lockOpen});
});

router.post("/tooted/:id", middleware.checkIpSessionValid, async (req, res) => {
    let sql = mysql.format(sqlString.hetke_kogusNIMETUS, [req.body.nimetus]);
    let kogus2 = await sqlFun.makeSqlQuery(sql, "/admin", "Koguse saamisega tekkis viga", req);

    let kategooria = parseFloat(req.body.kategooria);
    let kogus = parseFloat(req.body.kogus).toFixed(2);
    let myygi_hind = parseFloat(req.body.myygi_hind).toFixed(2);
    let oma_hind = parseFloat(req.body.oma_hind).toFixed(2);
    sql = mysql.format(sqlString.updateToode, [kategooria, req.body.nimetus, kogus, myygi_hind, oma_hind, req.params.id]);
    console.log(`========== TOOTE ${req.body.nimetus} ANDMEID MUUDETUD ==========`);
    await sqlFun.makeSqlQuery(sql, "/admin", "Toote andmete uuendamisega tekkis viga", req);

    if (kogus - kogus2[0].hetke_kogus !== 0) {
        sql = mysql.format(sqlString.insertTooteMuutus, [req.body.nimetus, kogus - kogus2[0].hetke_kogus, "muutmine"]);
    	await sqlFun.makeSqlQuery(sql, "/admin", "Kasutajate muutuste tabelisse lisamine ebaõnnestus", req);
    }

    res.redirect("/admin/tooted");
});

router.get("/tooted/muuda/:id", middleware.checkIpSessionValid, async (req, res) => {
    let toode = await sqlFun.getToode(req.params.id, req);
    res.render("admin/muudaToode", {toode: toode[0], lockOpen: lockOpen});
});

router.get("/tooted/uus", middleware.checkIpSessionValid, (req, res) => {
    res.render("admin/uusToode", {lockOpen: lockOpen});
});

router.post("/tooted", middleware.checkIpSessionValid, async (req, res) => {
    let kategooria = parseFloat(req.body.kategooria);
    let kogus = parseFloat(req.body.kogus).toFixed(2);
    let myygi_hind = parseFloat(req.body.myygi_hind).toFixed(2);
    let oma_hind = parseFloat(req.body.oma_hind).toFixed(2);
    let sql = mysql.format(sqlString.insertToode, [kategooria, req.body.nimetus, kogus, myygi_hind, oma_hind]);
    console.log("========== LISA TOODE ANDMEBAASI ==========");
    await sqlFun.makeSqlQuery(sql, "/admin", "Toote lisamisega tekkis viga", req);

    console.log(`Uus toode lisatud:\nkategooria - ${kategooria} | kogus - ${kogus} | müügi hind - ${myygi_hind}`);
    console.log(`oma hind - ${oma_hind} | nimetus${req.body.nimetus}`);

    sql = mysql.format(sqlString.insertTooteMuutus, [req.body.nimetus, kogus, "lisamine"]);
    await sqlFun.makeSqlQuery(sql, "/admin", "Toote muutuste tabelisse lisamine ebaõnnestus", req);

    res.redirect("/admin/tooted");
});

router.post("/tooted/:id/kustuta", middleware.checkIpSessionValid, async (req, res) => {
    let sql = mysql.format(sqlString.tooteNimetusID, [req.params.id]);
    let toode = await sqlFun.makeSqlQuery(sql, "/admin", "Toote saamisega tekkis viga", req);

    await sqlFun.deleteToode(req);

    sql = mysql.format(sqlString.insertTooteMuutus, [toode[0].nimetus, toode[0].hetke_kogus * -1, "kustutamine"]);
    await sqlFun.makeSqlQuery(sql, "/admin", "Toote muutuste tabelisse lisamine ebaõnnestus", req);
    res.redirect("/admin/tooted");
});

router.get("/ostud", middleware.checkIpSessionValid, async (req, res) => {
    let ostud = await sqlFun.getOstud(req);
    ostudeArv = getLength(ostud);

    res.render("admin/ostudeNimekiri", {ostud: ostud.slice(0, 50), numberOfPages: 100, currentPage: 1, lockOpen: lockOpen});
});

router.get("/ostud/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostud = await sqlFun.getOstud(req);
    let page = parseInt(req.params.page, 10);
    if (page > Math.ceil(ostudeArv / 50) || page < 1) {
	let err = new Error(`${page} lehekülg ostudes ei eksisteeri`);
  	err.statusCode = 600;
  	next(err);
    } else {
    	res.render("admin/ostudeNimekiri", {ostud: ostud, numberOfPages: Math.ceil(ostudeArv / 50), currentPage: page, lockOpen: lockOpen});
    }
});

router.get("/csv", middleware.checkIpSessionValid, async (req, res) => {
    let ostud = await sqlFun.getVolad(req);
    console.log("Võlgade CSV päriti");
    res.setHeader('Content-Type', 'text/csv', 'charset=utf-8,%EF%BB%B');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'võlad-' + Date.now() + '.csv\"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    stringify(ostud, { header: true }).pipe(res);
});

router.post("/ostudeCSV", middleware.checkIpSessionValid, async (req, res) => {
    let tooted = await sqlFun.getTooted(req);
    console.log("Ostude CSV päriti");
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'ostud-' + req.body.start + '-' + req.body.end + '.csv\"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    stringify(tooted, { header: true }).pipe(res);
});

router.get("/muutused/ladu", middleware.checkIpSessionValid, async (req, res) => {
    let muutused = await sqlFun.getToodeteMuutused(req);
    muutusteArvLadu = getLength(muutused);

    res.render("admin/laoMuutused", {muutused: muutused.slice(0, 50), numberOfPages: Math.ceil(muutusteArvLadu / 50), currentPage: 1, lockOpen: lockOpen});
});

router.get("/muutused/ladu/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getToodeteMuutused(req);
    let page = parseInt(req.params.page, 10);
    if (page > Math.ceil(muutusteArvLadu / 50) || page < 1) {
	let err = new Error(`${page} lehekülg lao muutustes ei eksisteeri`);
  	err.statusCode = 601;
  	next(err);
    } else {
    	res.render("admin/laoMuutused", {muutused: muutused, numberOfPages: Math.ceil(muutusteArvLadu / 50), currentPage: page, lockOpen: lockOpen});
    }
});

router.get("/muutused/kasutajad", middleware.checkIpSessionValid, async (req, res) => {
    let muutused = await sqlFun.getKasutajateMuutused(req);
    muutusteArvKasutajad = getLength(muutused);

    res.render("admin/kasutajateMuutused", {muutused: muutused.slice(0, 50), numberOfPages: Math.ceil(muutusteArvKasutajad / 50), currentPage: 1, lockOpen: lockOpen});
});

router.get("/muutused/kasutajad/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getKasutajateMuutused(req);
    let page = parseInt(req.params.page, 10);
    if (page > Math.ceil(muutusteArvKasutajad / 50) || page < 1) {
	let err = new Error(`${page} lehekülg kasutajate muutustes ei eksisteeri`);
  	err.statusCode = 602;
  	next(err);
    } else {
    	res.render("admin/kasutajateMuutused", {muutused: muutused, numberOfPages: Math.ceil(muutusteArvKasutajad / 50), currentPage: page, lockOpen: lockOpen});
    }
});

module.exports = router;

function getLength(obj) {
    let i = 0;
    for (num in obj) {
        i++;
    }
    return i;
}