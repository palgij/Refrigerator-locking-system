let rpio        = require("../middleware/gpio"),
    express     = require("express"),
    middleware  = require("../middleware/auth/regularAuth"),
    sqlFun      = require("../middleware/database/sqlFun/ostmineSqlFun"),
    router      = express.Router({mergeParams: true}),
    crypto      = require("../middleware/crypto");

// Toodete valik
router.get("/", middleware.checkUserSessionValid, async (req, res, next) => {
    let id = req.params.id;
    let results;
    // Kas id sisaldab kahte id mis on seotud "
    if (id.includes('"')) {
        let arr = id.split('"');
        id = arr[0]; // rebase id
        middleware.getUsers(id).newId = arr[1]; // kasutaja kellele ostetakse
        middleware.getUsers(id).reb = true; // rebane ostab teisele
        results = await sqlFun.getTootedJaKasutaja(crypto.decrypt(arr[1]), next);
    } else results = await sqlFun.getTootedJaKasutaja(crypto.decrypt(id), next);
    
    if (results === -1) return;

    // Andmebaasi operatsioon oli edukas
    let nimi = results[6][0].staatuse_nimetus + " " + results[6][0].eesnimi + " " + results[6][0].perenimi;
    middleware.getUsers(id).nimi = nimi; 
    res.render("tooted", {id: id, reb: !!middleware.getUsers(id).reb, jook1: results[0], jook2: results[1], jook3: results[2],
        jook4: results[3],sook5: results[4], sook6: results[5], nimi: nimi, seis: results[6][0].kasutaja_seisu_id});
});

// Rebane viipas kaarti
router.get("/paneKirja", middleware.checkUserSessionValid, async (req, res, next) => {
    let id = crypto.decrypt(req.params.id);  
    let kasutajad = await sqlFun.kasutajadPaneKirja(id, next);
    if (kasutajad === -1) return;
    let viimased12hKasutajad = await sqlFun.viimase12hKasutajad(id, next);
    if (viimased12hKasutajad === -1) return;

    // Krüpteeri iga kasutaja kaardi id
    viimased12hKasutajad.forEach((kasutaja) => {
        kasutaja.kaardi_id = crypto.encrypt(kasutaja.kaardi_id);
    });

    // Viimased 12h kasutajad saadi kätte, sorteeri kasutajad, iga coetus oma arraysse
    let uusKasutajad = [];
    let str = "";
    let num = -1;
    kasutajad.forEach((kasutaja) => {
        if (str !== kasutaja.coetus) {
            str = kasutaja.coetus;
            num++;
            uusKasutajad.push([]);
        }
	kasutaja.kaardi_id = crypto.encrypt(kasutaja.kaardi_id);
        uusKasutajad[num].push(kasutaja);
    });
    res.render("paneKirja", {kasutajad: uusKasutajad, rebId: crypto.encrypt(id), viimane12h: viimased12hKasutajad});
});

// Kalkulaatori vaade
router.get("/:toode/", middleware.checkUserSessionValid, async (req, res, next) => {
    let toode = req.params.toode;
    let id = req.params.id;
    let hind = await sqlFun.myygiHindNim(toode, next);
    if (hind === -1) return;

    let nimi = middleware.getUsers(id).nimi;
    middleware.getUsers(id).hind = hind[0].myygi_hind;
    res.render("kogus", {id: id, reb: !!middleware.getUsers(id).reb, newId: middleware.getUsers(id).newId,
        toode: toode, hind: hind[0].myygi_hind, nimi: nimi});
});

// Soorita ost
router.post("/:toode", middleware.checkUserSessionValid, async (req, res, next) => {
    let hind = middleware.getUsers(req.params.id).hind;
    let kategooria;
    let volg;
    let ost = {
        toode   : req.params.toode,
        id      : req.params.id,
        kogus   : parseFloat(req.body.kogus),
        summa   : hind * parseFloat(req.body.kogus),
        nimi    : middleware.getUsers(req.params.id).nimi,
        tasuta  : false
    };
    let result = await sqlFun.tooteKategooriaOmaHindID(ost.toode, next);
    if (result === -1) return;

    kategooria = result[0].toote_kategooria_id;
    ost.oma = result[0].oma_hind * ost.kogus;
    //console.log("========== LISA SUMMA KASUTAJA VÕLGA ==========");
    if (!!middleware.getUsers(ost.id).reb) result = await sqlFun.volgStaatusID(crypto.decrypt(middleware.getUsers(ost.id).newId), next);
    else result = await sqlFun.volgStaatusID(crypto.decrypt(ost.id), next);
            
    if (result === -1) return;

    volg = parseFloat(result[0].volg);
    // Kui ei ole rebane lisa summa kasutaja võlga
    if (result[0].kasutaja_staatuse_id === 1 && (kategooria === 1 || kategooria === 2)) {
        ost.tasuta = true;
    } else {
        volg += ost.summa;
        if (!!middleware.getUsers(ost.id).reb) result = await sqlFun.updateVolgID(crypto.decrypt(middleware.getUsers(ost.id).newId), volg, next);
        else result = await sqlFun.updateVolgID(crypto.decrypt(ost.id), volg, next);
    }
    if(result === -1) return;

    //console.log("========== MUUDA TOOTE KOGUST ==========");
    result = await sqlFun.hetkeKogusNimetus(ost.toode, next);
    if (result === -1) return;

    let total = parseFloat(result[0].hetke_kogus) - ost.kogus;
    if (await sqlFun.updateKogusNimetus(total, ost.toode, next) === -1) return;
    
    //console.log("========== LISA OST ANDMEBAASI ==========");
    
    if (await sqlFun.lisaOst(ost, !!middleware.getUsers(ost.id).reb, next) === -1) return;

    rpio.lockOpen();
    middleware.removeUser(ost.id);
    req.flash("SUCCESS", "Edukas ost! Kapp on avatud 10s", "/");
});

module.exports = router;