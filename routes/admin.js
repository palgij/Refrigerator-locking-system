let express     = require("express"),
    middleware  = require("../middleware/adminAuth"),
    sqlFun      = require("../middleware/sqlFun"),
    errorCodes	= require("../middleware/errorCodes"),
    stringify   = require("csv-stringify"),
    gpio        = require("../middleware/gpio"),
    email	= require("../middleware/sendMail"),
    router      = express.Router();

let password = "admin";
let ostudeArv;
let muutusteArvKasutajad;
let muutusteArvLadu;
let lockOpen = false;

router.get("/", middleware.removeIp, (req, res) => {
    res.render("admin/adminSplash");
});

router.post("/", (req, res, next) => {
    if (req.body.password === password) {
        middleware.addIp(req.clientIp);
	    res.redirect("/admin/kodu");
    } else {
        let err = new Error(errorCodes.WRONG_PASSWORD.message);
  	    err.statusCode = errorCodes.WRONG_PASSWORD.code;
  	    next(err);
    }
});

router.get("/toggleLukk", middleware.checkIpSessionValid, (req, res) => {
    // TODO tee loogika uuesti kui läheb päriselt laivi!
    gpio.toggleLock();
    lockOpen = !lockOpen;
    let text = lockOpen ? "Kapp on avatud." : "Kapp on suletud."
    let requestedAddress = req.headers.referer.split("3000")[1];
    if (requestedAddress.includes("kodu")) req.flash("SUCCESS2", text, requestedAddress);
    else req.flash("SUCCESS3", text, requestedAddress);
});

router.get("/kodu", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostjad = await sqlFun.getOstjadTop(next);
    let tooted = await sqlFun.getTootedTop(next);
    if (ostjad !== -1 && tooted !== -1)
    	res.render("admin/kodu", {tooted: tooted, ostjad: ostjad, lockOpen: lockOpen})
});

router.get("/kasutajad", middleware.checkIpSessionValid, async (req, res, next) => {
    let kasutajad = await sqlFun.getKasutajad(next);
    if (kasutajad !== -1)
	res.render("admin/kasutajad", {kasutajad: kasutajad, lockOpen: lockOpen});
});

router.post("/kasutajad", middleware.checkIpSessionValid, async (req, res, next) => {
    if (await sqlFun.nulliVolad(next) !== -1) {
	if (req.headers.referer.split("3000")[1].includes("kodu")) req.flash("SUCCESS2", "Võlad said nullitud.", req.headers.referer.split("3000")[1]);
        else req.flash("SUCCESS3", "Võlad said nullitud.", req.headers.referer.split("3000")[1]);
    }
});

router.post("/kasutajad/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    let kasutaja = await sqlFun.getKasutaja(req.params.id, next);
    if (kasutaja !== -1) {
    	let arr = [];
    	let fields = {
            id: req.params.id,
            eesnimi: req.body.eesnimi,
            perenimi: req.body.perenimi,
            volg: parseFloat(req.body.volg).toFixed(2),
            kinnitatud: !!req.body.check,
            seisus: parseFloat(req.body.seis),
            staatus: parseFloat(req.body.staatus)
    	};

    	if (fields.seisus !== kasutaja[0].kasutaja_seisu_id) arr.push("seisus");
    	if (fields.staatus !== kasutaja[0].kasutaja_staatuse_id) arr.push("staatus");
    	if (fields.eesnimi !== kasutaja[0].eesnimi) arr.push("eesnimi");
    	if (fields.perenimi !== kasutaja[0].perenimi) arr.push("perenimi");
    	if (fields.volg !== parseFloat(kasutaja[0].volg).toFixed(2)) arr.push("volg");
    	if (fields.kinnitatud != kasutaja[0].admin_on_kinnitanud) arr.push("kinnitanud");

    	if (arr.length !== 0 && arr.length !== undefined) {
            if (await sqlFun.updateKasutaja(next, fields, arr) !== -1)
            	req.flash("SUCCESS3", "Kasutaja andmed said muudetud.", "/admin/kasutajad");
    	} else res.redirect("/admin/kasutajad");
    }
});

router.get("/kasutajad/muuda/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    let kasutaja = await sqlFun.getKasutaja(req.params.id, next);
    if (kasutaja !== -1)
	res.render("admin/muuda", {kasutaja: kasutaja[0], lockOpen: lockOpen});
});

router.post("/kasutajad/:id/kustuta", middleware.checkIpSessionValid, async (req, res, next) => {
    if (await sqlFun.deleteKasutaja(req, next) !== -1)
    	req.flash("SUCCESS3", "Kasutaja sai kustutatud.", "/admin/kasutajad");
});

router.get("/tooted", middleware.checkIpSessionValid, async (req, res, next) => {
    let joogid = await sqlFun.getJoogid(next);
    let soogid = await sqlFun.getSoogid(next);
    if (soogid !== -1 && joogid !== -1)
	res.render("admin/tooted", {joogid: joogid, soogid: soogid, lockOpen: lockOpen});
});

router.post("/tooted/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    let toode = await sqlFun.getToodeID(req, next);
    if (toode !== -1) {
    	let arr = [];
    	let fields = {
            id: req.params.id,
            nimetus: req.body.nimetus,
            kategooria: parseFloat(req.body.kategooria),
            uusKogus: parseFloat(req.body.kogus).toFixed(2),
            myygi_hind: parseFloat(req.body.myygi_hind).toFixed(2),
            oma_hind: parseFloat(req.body.oma_hind).toFixed(2),
            vanaKogus: parseFloat(toode[0].hetke_kogus).toFixed(2)
    	};

    	if (fields.nimetus !== toode.nimetus) arr.push("nimetus");
    	if (fields.kategooria !== parseFloat(toode.kategooria)) arr.push("kategooria");
    	if (fields.uusKogus !== parseFloat(toode.hetke_kogus).toFixed(2)) arr.push("hetke_kogus");
    	if (fields.myygi_hind !== parseFloat(toode.myygi_hind).toFixed(2)) arr.push("myygi_hind");
    	if (fields.oma_hind !== parseFloat(toode.oma_hind).toFixed(2)) arr.push("oma_hind");
    
    	if (arr.length !== 0 && arr.length !== undefined) {
            if (await sqlFun.updateToode(next, fields) !== -1)
            	req.flash("SUCCESS3", "Toote andmed said muudetud.", "/admin/tooted");
    	} else res.redirect("/admin/tooted");
    }
});

router.get("/tooted/muuda/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    let toode = await sqlFun.getToode(req.params.id, next);
    if (toode !== -1)
	res.render("admin/muudaToode", {toode: toode[0], lockOpen: lockOpen});
});

router.get("/tooted/uus", middleware.checkIpSessionValid, (req, res) => {
    res.render("admin/uusToode", {lockOpen: lockOpen});
});

router.post("/tooted", middleware.checkIpSessionValid, async (req, res, next) => {
    let toode = {
        nimetus: req.body.nimetus,
        kategooria: parseFloat(req.body.kategooria),
        kogus: parseFloat(req.body.kogus).toFixed(2),
        myygi_hind: parseFloat(req.body.myygi_hind).toFixed(2),
        oma_hind: parseFloat(req.body.oma_hind).toFixed(2)
    }
    
    if(await sqlFun.insertToode(next, toode) !== -1)
    	req.flash("SUCCESS3", "Uus toode sai lisatud.", "/admin/tooted");
});

router.post("/tooted/:id/kustuta", middleware.checkIpSessionValid, async (req, res, next) => {
    if (await sqlFun.deleteToode(req, next) !== -1)
    	req.flash("SUCCESS3", "Toode sai kustutatud.", "/admin/tooted");
});

router.get("/ostud", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostud = await sqlFun.getOstud(req, next);
    if (ostud !== -1) {
    	ostudeArv = getLength(ostud);
    	res.render("admin/ostudeNimekiri", {ostud: ostud.slice(0, 50), numberOfPages: Math.ceil(ostudeArv / 50), currentPage: 1, lockOpen: lockOpen});
    }
});

router.get("/ostud/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostud = await sqlFun.getOstud(req, next);
    if (ostud !== -1) {
    	let page = parseInt(req.params.page, 10);
    	if (page > Math.ceil(ostudeArv / 50) || page < 1) {
	    let err = new Error(`${page} ${errorCodes.NO_SUCH_PAGE_IN_OSTUD.message}`);
  	    err.statusCode = errorCodes.NO_SUCH_PAGE_IN_OSTUD.code; 
    	    next(err);
    	} else {
    	    res.render("admin/ostudeNimekiri", {ostud: ostud, numberOfPages: Math.ceil(ostudeArv / 50), currentPage: page, lockOpen: lockOpen});
    	}
    }
});

router.get("/csv", middleware.checkIpSessionValid, async (req, res, next) => {
    let volad = await sqlFun.getVolad(next);
    console.log("Võlgade CSV päriti");
    if (volad !== -1) {
    	if (volad !== -1 && volad.length !== 0) {
    	    res.setHeader('Content-Type', 'text/csv');
    	    res.setHeader('Content-Disposition', `attachment; filename=\"võlad-${Date.now()}.csv\"`);
    	    res.setHeader('Cache-Control', 'no-cache');
    	    res.setHeader('Pragma', 'no-cache');
    	    stringify(volad, { header: true }).pipe(res);
    	} else {
            if (req.headers.referer.split("3000")[1].includes("kodu")) req.flash("ERROR", "Võlad on kõik nullid.", req.headers.referer.split("3000")[1]);
            else req.flash("WARN", "Võlad on kõik nullid.", req.headers.referer.split("3000")[1]);
        }
    }
});

router.post("/ostudeCSV", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostud = await sqlFun.getOstudAeg(req, next);
    console.log("Ostude CSV päriti");
    if (ostud !== -1) {
    	if (ostud.length !== 0) {
    	    res.setHeader('Content-Type', 'text/csv');
    	    res.setHeader('Content-Disposition', `attachment; filename=\"ostud-${req.body.start}-${req.body.end}.csv\"`);
    	    res.setHeader('Cache-Control', 'no-cache');
    	    res.setHeader('Pragma', 'no-cache');
    	    stringify(ostud, { header: true }).pipe(res);
    	} else req.flash("WARN", "Ühtegi rida andmebaasist ei leitud.", "/admin/ostud");
    }
});

router.get("/muutused/ladu", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getToodeteMuutused(req, next);
    if (muutused !== -1) {
    	muutusteArvLadu = getLength(muutused);
	res.render("admin/laoMuutused", {muutused: muutused.slice(0, 50), numberOfPages: Math.ceil(muutusteArvLadu / 50), currentPage: 1, lockOpen: lockOpen});
    }
});

router.get("/muutused/ladu/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getToodeteMuutused(req, next);
    if (muutused !== -1) {
    	let page = parseInt(req.params.page, 10);
    	if (page > Math.ceil(muutusteArvLadu / 50) || page < 1) {
	    let err = new Error(`${page} ${errorCodes.NO_SUCH_PAGE_IN_LAO_MUUTUSED.message}`);
    	    err.statusCode = errorCodes.NO_SUCH_PAGE_IN_LAO_MUUTUSED.code;
  	    next(err);
    	} else {
    	    res.render("admin/laoMuutused", {muutused: muutused, numberOfPages: Math.ceil(muutusteArvLadu / 50), currentPage: page, lockOpen: lockOpen});
    	}
    }
});

router.get("/muutused/kasutajad", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getKasutajateMuutused(req, next);
    if (muutused !== -1) {
    	muutusteArvKasutajad = getLength(muutused);
    	res.render("admin/kasutajateMuutused", {muutused: muutused.slice(0, 50), numberOfPages: Math.ceil(muutusteArvKasutajad / 50), currentPage: 1, lockOpen: lockOpen});
    }
});

router.get("/muutused/kasutajad/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getKasutajateMuutused(req, next);
    if (muutused !== -1) {
    	let page = parseInt(req.params.page, 10);
    	if (page > Math.ceil(muutusteArvKasutajad / 50) || page < 1) {
	    let err = new Error(`${page} ${errorCodes.NO_SUCH_PAGE_IN_KASUTAJATE_MUUTUSED.message}`);
    	    err.statusCode = errorCodes.NO_SUCH_PAGE_IN_KASUTAJATE_MUUTUSED.code;
  	    next(err);
    	} else {
    	    res.render("admin/kasutajateMuutused", {muutused: muutused, numberOfPages: Math.ceil(muutusteArvKasutajad / 50), currentPage: page, lockOpen: lockOpen});
    	}
    }
});

router.post("/kuuLopp", middleware.checkIpSessionValid, async (req, res, next) => {
    let olledSumma = await sqlFun.rebasteJoodudOlled(next);
    if (olledSumma !== -1) {
    	let volad = await sqlFun.getVolad(next);
    	if (volad !== -1 && (olledSumma[0].olledSumma !== 0 || volad.length !== 0)) {
    	    try {
		var result = await email.bibendileMeil(voladToCsv(volad), olledSumma[0].olledSumma);
	    } catch (err) {
		next(err);
	    }
	    if (!!result) {
		if (await sqlFun.nulliVolad(next) !== -1)
	            req.flash("SUCCESS2", "Kuulõpu esitamine oli edukas.", req.headers.referer.split("3000")[1]);
	    }
	} else {
	    if (volad !== -1)
		req.flash("SUCCESS2", "Kuulõppu ei esitatud, kuna pole midagi esitada.", req.headers.referer.split("3000")[1]);
	}
    }
});

module.exports = router;

let getLength = (obj) => {
    let i = 0;
    for (num in obj) {
        i++;
    }
    return i;
};

let voladToCsv = arr => {
    let csv = [];

    for (i = 0; i < arr.length; i++) {
    	if (i === 0) csv.push(Object.keys(arr[i]).join(","));
    	csv.push(Object.values(arr[i]).join(","));
    }
    return csv.join("\n");
};