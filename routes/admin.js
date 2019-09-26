let express     = require("express"),
    middleware  = require("../middleware/adminAuth"),
    sqlFun      = require("../middleware/sqlFun"),
    sqlString   = require("../middleware/sqlString"),
    mysql       = require("mysql"),
    stringify   = require("csv-stringify"),
    gpio	= require("../middleware/gpio"),
    router      = express.Router();

let password = "admin";
let ostudeArv;
let muutusteArvKasutajad;
let muutusteArvLadu;

router.get("/", middleware.removeIp, (req, res) => {
    res.render("admin/adminSplash");
});

router.post("/", (req, res) => {
    if (req.body.password === password) {
        middleware.addIp(req.clientIp);
	    res.redirect("/admin/kodu");
    } else {
	    req.flash("ERROR", "Vale salasõna või kasutaja", "/admin");
    }
});

router.get("/toggleLukk", middleware.checkIpSessionValid, (req, res) => {
    // TODO tee loogika uuesti kui läheb päriselt laivi!
    gpio.toggleLock();
    let split = req.headers.referer.split("3000");
    res.redirect(split[1]);
});

router.get("/kodu", middleware.checkIpSessionValid, async (req, res) => {
    let ostjad = await sqlFun.getOstjadTop(req);
    let tooted = await sqlFun.getTootedTop(req);
    res.render("admin/kodu", {tooted: tooted, ostjad: ostjad})
});

router.get("/kasutajad", middleware.checkIpSessionValid, async (req, res) => {
    let kasutajad = await sqlFun.getKasutajad(req);
    res.render("admin/kasutajad", {kasutajad: kasutajad});
});

router.post("/kasutajad", middleware.checkIpSessionValid, async (req, res) => {
    await sqlFun.nulliVolad(req);
    res.redirect("/admin/kasutajad");
});

router.post("/kasutajad/:id", middleware.checkIpSessionValid, async (req, res) => {
    let volg = parseFloat(req.body.volg).toFixed(2);
    let checkbox = req.body.check;
    let kinnitatud;
    let seisus = parseFloat(req.body.seis);
    let staatus = parseFloat(req.body.staatus);
    kinnitatud = !!checkbox;
    let sql = mysql.format(sqlString.updateKasutaja, [seisus, staatus, req.body.eesnimi, req.body.perenimi, volg, kinnitatud, req.params.id]);
    console.log("========== MUUDA KASUTAJA ANDMEID ==========");
    let result = await sqlFun.makeSqlQuery(sql, "/admin", "Kasutaja andmete uuendamisega tekkis viga", req);
    console.log(result.message);
    res.redirect("/admin/kasutajad");
});

router.get("/kasutajad/muuda/:id", middleware.checkIpSessionValid, async (req, res) => {
    let kasutaja = await sqlFun.getKasutaja(req.params.id, req);
    res.render("admin/muuda", {kasutaja: kasutaja[0]});
});

router.post("/kasutajad/:id/kustuta", middleware.checkIpSessionValid, async (req, res) => {
    await sqlFun.deleteKasutaja(req);
    res.redirect("/admin/kasutajad");
});

router.get("/tooted", middleware.checkIpSessionValid, async (req, res) => {
    let joogid = await sqlFun.getJoogid(req);
    let soogid = await sqlFun.getSoogid(req);
    res.render("admin/tooted", {joogid: joogid, soogid: soogid});
});

router.post("/tooted/:id", middleware.checkIpSessionValid, async (req, res) => {
    let kategooria = parseFloat(req.body.kategooria);
    let kogus = parseFloat(req.body.kogus).toFixed(2);
    let myygi_hind = parseFloat(req.body.myygi_hind).toFixed(2);
    let oma_hind = parseFloat(req.body.oma_hind).toFixed(2);
    let sql = mysql.format(sqlString.updateToode, [kategooria, req.body.nimetus, kogus, myygi_hind, oma_hind, req.params.id]);
    console.log("========== MUUDA TOOTE ANDMEID ==========");
    let result = await sqlFun.makeSqlQuery(sql, "/admin", "Toote andmete uuendamisega tekkis viga", req);
    console.log(result.message);
    res.redirect("/admin/tooted");
});

router.get("/tooted/muuda/:id", middleware.checkIpSessionValid, async (req, res) => {
    let toode = await sqlFun.getToode(req.params.id, req);
    res.render("admin/muudaToode", {toode: toode[0]});
});

router.get("/tooted/uus", middleware.checkIpSessionValid, (req, res) => {
    res.render("admin/uusToode");
});

router.post("/tooted", middleware.checkIpSessionValid, async (req, res) => {
    let kategooria = parseFloat(req.body.kategooria);
    let kogus = parseFloat(req.body.kogus).toFixed(2);
    let myygi_hind = parseFloat(req.body.myygi_hind).toFixed(2);
    let oma_hind = parseFloat(req.body.oma_hind).toFixed(2);
    let sql = mysql.format(sqlString.insertToode, [kategooria, req.body.nimetus, kogus, myygi_hind, oma_hind]);
    console.log("========== LISA TOODE ANDMEBAASI ==========");
    await sqlFun.makeSqlQuery(sql, "/admin", "Toote lisamisega tekkis viga", req);

    console.log("Uus toode lisatud: ");
    console.log("kategooria - " + kategooria);
    console.log("kogus - " + kogus);
    console.log("myygi hind - " + myygi_hind);
    console.log("oma hind - " + oma_hind);
    console.log("nimetus - " + req.body.nimetus);
    res.redirect("/admin/tooted");
});

router.post("/tooted/:id/kustuta", middleware.checkIpSessionValid, async (req, res) => {
    await sqlFun.deleteToode(req);
    res.redirect("/admin/tooted");
});

router.get("/ostud", middleware.checkIpSessionValid, async (req, res) => {
    let ostud = await sqlFun.getOstud(req);
    ostudeArv = getLength(ostud);
    let uuedOstud = [];
    let k = 0;
    for (let i = 0; i <= 49; i++) {
	if (ostud[i]) {
	    uuedOstud[k] = ostud[i];
	    k++;
	} else break;
    }
    res.render("admin/ostudeNimekiri", {ostud: uuedOstud, numberOfPages: Math.ceil(ostudeArv / 50), currentPage: 1});
});

router.get("/ostud/:page", middleware.checkIpSessionValid, async (req, res) => {
    let ostud = await sqlFun.getOstud(req);
    let page = parseInt(req.params.page, 10);
    let uuedOstud = [];
    let start = (req.params.page - 1) * 50;
    let k = 0;
    for (let i = start; i < start + 49; i++) {
	if (ostud[i]) {
	    uuedOstud[k] = ostud[i];
	    k++;
	} else break;
    }
    res.render("admin/ostudeNimekiri", {ostud: uuedOstud, numberOfPages: Math.ceil(ostudeArv / 50), currentPage: page});
});

router.get("/csv", middleware.checkIpSessionValid, async (req, res) => {
    let ostud = await sqlFun.getVolad(req);
    console.log(ostud);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'võlad-' + Date.now() + '.csv\"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    stringify(ostud, { header: true }).pipe(res);
});

router.post("/ostudeCSV", middleware.checkIpSessionValid, async (req, res) => {
    let tooted = await sqlFun.getTooted(req);
    console.log(tooted);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'ostud-' + req.body.start + '-' + req.body.end + '.csv\"');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');
    stringify(tooted, { header: true }).pipe(res);
});

router.get("/muutused/ladu", middleware.checkIpSessionValid, async (req, res) => {
    let muutused = await sqlFun.getToodeteMuutused(req); // LISA SEE SQLSTRINGI
    muutusteArvLadu = getLength(muutused);
    let uuedMuutused = [];
    let k = 0;
    for (let i = 0; i <= 49; i++) {
	if (muutused[i]) {
	    uuedMuutused[k] = muutused[i];
	    k++;
	} else break;
    }
    res.render("admin/laoMuutused", {muutused: uuedMuutused, numberOfPages: Math.ceil(muutusteArvLadu / 50), currentPage: 1});
});

router.get("/muutused/ladu/:page", middleware.checkIpSessionValid, async (req, res) => {
    let muutused = await sqlFun.getToodeteMuutused(req);
    let page = parseInt(req.params.page, 10);
    let uuedMuutused = [];
    let start = (req.params.page - 1) * 50;
    let k = 0;
    for (let i = start; i < start + 49; i++) {
	if (muutused[i]) {
	    uuedMuutused[k] = muutused[i];
	    k++;
	} else break;
    }
    res.render("admin/laoMuutused", {muutused: uuedMuutused, numberOfPages: Math.ceil(muutusteArvLadu / 50), currentPage: page});
});

router.get("/muutused/kasutajad", middleware.checkIpSessionValid, async (req, res) => {
    let muutused = await sqlFun.getKasutajateMuutused(req);
    muutusteArvKasutajad = getLength(muutused);
    let uuedMuutused = [];
    let k = 0;
    for (let i = 0; i <= 49; i++) {
	if (muutused[i]) {
	    uuedMuutused[k] = muutused[i];
	    k++;
	} else break;
    }
    res.render("admin/kasutajateMuutused", {muutused: uuedMuutused, numberOfPages: Math.ceil(muutusteArvKasutajad / 50), currentPage: 1});
});

router.get("/muutused/kasutajad/:page", middleware.checkIpSessionValid, async (req, res) => {
    let muutused = await sqlFun.getKasutajateMuutused(req); // LISA SEE SQLSTRINGI
    let page = parseInt(req.params.page, 10);
    let uuedMuutused = [];
    let start = (req.params.page - 1) * 50;
    let k = 0;
    for (let i = start; i < start + 49; i++) {
	if (muutused[i]) {
	    uuedMuutused[k] = muutused[i];
	    k++;
	} else break;
    }
    res.render("admin/kasutajateMuutused", {muutused: uuedMuutused, numberOfPages: Math.ceil(muutusteArvKasutajad / 50), currentPage: page});
});

module.exports = router;

function getLength(obj) {
    let i = 0;
    for (num in obj) {
        i++;
    }
    return i;
}