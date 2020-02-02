let express     = require("express"),
    middleware  = require("../../middleware/auth/adminAuth"),
    sqlFun      = require("../../middleware/database/sqlFun/adminSqlFun"),
    errorCodes	= require("../../middleware/errorCodes"),
    stringify   = require("csv-stringify"),
    gpio        = require("../../middleware/gpio"),
    email		= require("../../middleware/sendMail"),
    router      = express.Router();

let ostudeArv;
let muutusteArvKasutajad;
let muutusteArvLadu;
let lockClosed = async (next) => {
    let lockState = await sqlFun.getLockState(next);
    return lockState[0].lukk_kinni === 1
};
let password = async () => {
    let credentials = await sqlFun.getCredentials('admin', console.log);
    return credentials[0].salasona
};

// Sisesta parool
router.get("/", middleware.removeIp, (req, res) => {
    res.render("admin/adminSplash");
});

// Parooli kontroll
router.post("/", async (req, res, next) => {
    if (req.body.password === await password()) {
        middleware.addIp(req.clientIp);
        res.redirect("/admin/kodu");
    } else {
        let err = new Error(errorCodes.WRONG_PASSWORD.message);
            err.statusCode = errorCodes.WRONG_PASSWORD.code;
            next(err);
    }
});

// Ava/sulge lukk
router.put("/toggleLukk", middleware.checkIpSessionValid, async (req, res, next) => {
    let isLockClosed = await lockClosed(next);
    if (isLockClosed === -1) return;
    
    gpio.toggleLock(isLockClosed);

    // Luku uus staatus andmebaasis muutmiseks
    let state = isLockClosed ? false : true;
    if (await sqlFun.setLockState(state, console.log) === -1) {
        setTimeout(sqlFun.setLockState.bind(null, state, console.log), 2000);
    }
    let text = isLockClosed ? "Kapp on avatud." : "Kapp on suletud.";
    let requestedAddress = req.headers.referer.split("3000")[1];
    if (requestedAddress.includes("kodu")) req.flash("SUCCESS2", text, requestedAddress);
    else req.flash("SUCCESS3", text, requestedAddress);
});

// Top ostjad ja tooted
router.get("/kodu", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostjad = await sqlFun.getOstjadTop(next);
    if (ostjad === -1) return;
    let tooted = await sqlFun.getTootedTop(next);
    if (tooted === -1) return;
    
    res.render("admin/kodu", {tooted: tooted, ostjad: ostjad, lockClosed: await lockClosed(console.log)})
});

// Võlgade CSV
router.get("/csv", middleware.checkIpSessionValid, async (req, res, next) => {
    console.log("Võlgade CSV päriti");
    let volad = await sqlFun.getVolad(next);
    if (volad === -1) return;
        
    if (volad.length !== 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=\"võlad-${Date.now()}.csv\"`);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');
        stringify(volad, { header: true }).pipe(res);
    } else {
        if (req.headers.referer.split("3000")[1].includes("kodu")) 
            req.flash("ERROR", "Võlad on kõik nullid.", req.headers.referer.split("3000")[1]);
        else 
            req.flash("WARN", "Võlad on kõik nullid.", req.headers.referer.split("3000")[1]);
    }
});

// Ostude CSV
router.post("/ostudeCSV", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostud = await sqlFun.getOstudAeg(req, next);
    console.log("Ostude CSV päriti");
    if (ostud === -1) return;

    if (ostud.length !== 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=\"ostud-${req.body.start}-${req.body.end}.csv\"`);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Pragma', 'no-cache');
        stringify(ostud, { header: true }).pipe(res);
    } else 
        req.flash("WARN", "Ühtegi rida andmebaasist ei leitud.", req.headers.referer.split("3000")[1]);
});

// 100 viimast ostu
router.get("/ostud", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostud = await sqlFun.getOstud(req, next);
    if (ostud === -1) return;

    ostudeArv = getLength(ostud);		
    res.render("admin/ostudeNimekiri", {ostud: ostud.slice(0, 100), numberOfPages: Math.ceil(ostudeArv / 100), currentPage: 1, lockClosed: await lockClosed(console.log)});
});

// 100 ostu lk kaupa
router.get("/ostud/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let ostud = await sqlFun.getOstud(req, next);
    if (ostud === -1) return;
    
    let page = parseInt(req.params.page, 10);
    if (page > Math.ceil(ostudeArv / 100) || page < 1) {
        let err = new Error(`${page} ${errorCodes.NO_SUCH_PAGE_IN_OSTUD.message}`);
        err.statusCode = errorCodes.NO_SUCH_PAGE_IN_OSTUD.code; 
        next(err);
    } else {
        res.render("admin/ostudeNimekiri", {ostud: ostud, numberOfPages: Math.ceil(ostudeArv / 100), currentPage: page, lockClosed: await lockClosed(console.log)});
    }
});

// 100 viimast lao muutust
router.get("/muutused/ladu", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getToodeteMuutused(req, next);
    if (muutused === -1) return;
    
    muutusteArvLadu = getLength(muutused);
    res.render("admin/laoMuutused", {muutused: muutused.slice(0, 100), numberOfPages: Math.ceil(muutusteArvLadu / 100), currentPage: 1, lockClosed: await lockClosed(console.log)});
});

// 100 viimast lao muutust lk kaupa
router.get("/muutused/ladu/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getToodeteMuutused(req, next);
    if (muutused === -1) return;

    let page = parseInt(req.params.page, 10);
    if (page > Math.ceil(muutusteArvLadu / 100) || page < 1) {
        let err = new Error(`${page} ${errorCodes.NO_SUCH_PAGE_IN_LAO_MUUTUSED.message}`);
        err.statusCode = errorCodes.NO_SUCH_PAGE_IN_LAO_MUUTUSED.code;
        next(err);
    } else {
        res.render("admin/laoMuutused", {muutused: muutused, numberOfPages: Math.ceil(muutusteArvLadu / 100), currentPage: page, lockClosed: await lockClosed(console.log)});
    }
});

// 100 viimast kasutajate muutust
router.get("/muutused/kasutajad", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getKasutajateMuutused(req, next);
    if (muutused === -1) return;

    muutusteArvKasutajad = getLength(muutused);
    res.render("admin/kasutajateMuutused", {muutused: muutused.slice(0, 100), numberOfPages: Math.ceil(muutusteArvKasutajad / 100), currentPage: 1, lockClosed: await lockClosed(console.log)});
});

// 100 viimast kasutajate muutust lk kaupa
router.get("/muutused/kasutajad/:page", middleware.checkIpSessionValid, async (req, res, next) => {
    let muutused = await sqlFun.getKasutajateMuutused(req, next);
    if (muutused === -1) return;
    
    let page = parseInt(req.params.page, 10);
    if (page > Math.ceil(muutusteArvKasutajad / 100) || page < 1) {
        let err = new Error(`${page} ${errorCodes.NO_SUCH_PAGE_IN_KASUTAJATE_MUUTUSED.message}`);
        err.statusCode = errorCodes.NO_SUCH_PAGE_IN_KASUTAJATE_MUUTUSED.code;
          next(err);
    } else {
        res.render("admin/kasutajateMuutused", {muutused: muutused, numberOfPages: Math.ceil(muutusteArvKasutajad / 100), currentPage: page, lockClosed: await lockClosed(console.log)});
    }
});

// Kuu lõpu operatsioon
router.put("/kuuLopp", middleware.checkIpSessionValid, async (req, res, next) => {
    let olledSumma = await sqlFun.rebasteJoodudOlled(next);
    if (olledSumma === -1) return;
    let volad = await sqlFun.getVolad(next);
    if (volad === -1) return;

    if (olledSumma[0].olledSumma !== 0 || volad.length !== 0) {
        try {
            var result = await email.bibendileMeil(voladToCsv(volad), olledSumma[0].olledSumma);
        } catch (err) {
            next(err);
        }
        if (!!result) {
            if (await sqlFun.nulliVolad(next, "võlad kuulõpp") === -1) return;
            
            if (await sqlFun.insertKuuLopp(olledSumma[0].olledSumma, parseFloat(volad.reduce(getSumOfVolad, 0)).toFixed(2), next) === -1) return;
            
            req.flash("SUCCESS2", "Kuulõpu esitamine oli edukas.", req.headers.referer.split("3000")[1]);
        }
    } else {
        req.flash("SUCCESS2", "Kuulõppu ei esitatud, kuna pole midagi esitada.", req.headers.referer.split("3000")[1]);
    }
});

// Inventuuri vaade
router.get("/inventuur", middleware.checkIpSessionValid, async (req, res, next) => {
    let tooted = await sqlFun.getTooted();
    if (tooted === -1) return;

    let uuedTooted = [];
    let id = 0;
    let num = -1;
    let sum = [];
    let sumAll = [];
    sumAll[0] = 0;
    sumAll[1] = 0;
    // Sorteeri tooted ja arvuta summad
    tooted.forEach((toode, i) => {
        if (id !== toode.toote_kategooria_id) {
            id = toode.toote_kategooria_id;
            num++;
            uuedTooted.push([]);
            sum.push([]);
            sum[num][0] = 0;
            sum[num][1] = 0;
        }
        sum[num][0] += toode.myygi_hind * toode.hetke_kogus;
        sum[num][1] += toode.oma_hind * toode.hetke_kogus;
        sumAll[0] += toode.myygi_hind * toode.hetke_kogus;
        sumAll[1] += toode.oma_hind * toode.hetke_kogus;
        uuedTooted[num].push(toode);
    });
    res.render("admin/inventuur", {tooted: uuedTooted, lockClosed: await lockClosed(console.log), sum: sum, sumAll: sumAll});
});

module.exports = router;

let getLength = (obj) => {
    let i = 0;
    for (num in obj) {
        i++;
    }
    return i;
};

let getSumOfVolad = (total, user) => total + user.volg;

// Muuda võlgade array CSVks
let voladToCsv = arr => {
    let csv = [];

    for (i = 0; i < arr.length; i++) {
        if (i === 0) {
        csv.push("sep=,")
        csv.push(Object.keys(arr[i]).join(","));
    }
        csv.push(Object.values(arr[i]).join(","));
    }
    return csv.join("\n");
};