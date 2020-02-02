let express     = require("express"),
    middleware  = require("../../middleware/auth/adminAuth"),
    sqlFun      = require("../../middleware/database/sqlFun/adminSqlFun"),
    router      = express.Router();

let lockClosed = async (next) => {
    let lockState = await sqlFun.getLockState(next);
    return lockState[0].lukk_kinni === 1
};

// Toodete tabel
router.get("/", middleware.checkIpSessionValid, async (req, res, next) => {
    let joogid = await sqlFun.getJoogid(next);
    if (joogid === -1) return;
    let soogid = await sqlFun.getSoogid(next);
    if (soogid === -1) return;

    res.render("admin/tooted", {joogid: joogid, soogid: soogid, lockClosed: await lockClosed(console.log)});
});

// Muuda toodet
router.put("/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    let toode = await sqlFun.getToodeID(req, next);
    if (toode === -1) return;
    
    let arr = [];
    let fields = {
        id              : req.params.id,
        toote_nimetus   : req.body.toote_nimetus,
        kategooria      : parseFloat(req.body.kategooria),
        uusKogus        : parseFloat(req.body.kogus).toFixed(2),
        myygi_hind      : parseFloat(req.body.myygi_hind).toFixed(2),
        oma_hind        : parseFloat(req.body.oma_hind).toFixed(2),
        vanaKogus       : parseFloat(toode[0].hetke_kogus).toFixed(2)
    };

    // Kontrolli kas toote väljasid muudeti
    if (fields.toote_nimetus !== toode.toote_nimetus) arr.push("nimetus");
    if (fields.kategooria !== parseFloat(toode.kategooria)) arr.push("kategooria");
    if (fields.uusKogus !== parseFloat(toode.hetke_kogus).toFixed(2)) arr.push("hetke_kogus");
    if (fields.myygi_hind !== parseFloat(toode.myygi_hind).toFixed(2)) arr.push("myygi_hind");
    if (fields.oma_hind !== parseFloat(toode.oma_hind).toFixed(2)) arr.push("oma_hind");
    
    // Kui väljasid muudeti muuda toodet
    if (arr.length !== 0 && arr.length !== undefined) {
        if (await sqlFun.updateToode(next, fields) === -1) return;
        
        req.flash("SUCCESS3", "Toote andmed said muudetud.", "/admin/tooted");
    } else 
        res.redirect("/admin/tooted");
});

// Toote muutmise vaade
router.get("/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    let toode = await sqlFun.getToode(req.params.id, next);
    if (toode === -1) return;

    res.render("admin/muudaToode", {toode: toode[0], lockClosed: await lockClosed(console.log)});
});

// Lisa toode vaade
router.get("/uusToode/lisa", middleware.checkIpSessionValid, async (req, res) => {
    res.render("admin/uusToode", {lockClosed: await lockClosed(console.log)});
});

// Lisa toode
router.post("/", middleware.checkIpSessionValid, async (req, res, next) => {
    let toode = {
        toote_nimetus   : req.body.toote_nimetus,
        kategooria      : parseFloat(req.body.kategooria),
        kogus           : parseFloat(req.body.kogus).toFixed(2),
        myygi_hind      : parseFloat(req.body.myygi_hind).toFixed(2),
        oma_hind        : parseFloat(req.body.oma_hind).toFixed(2)
    }
    
    if (await sqlFun.insertToode(next, toode) === -1) return;

    req.flash("SUCCESS3", "Uus toode sai lisatud.", "/admin/tooted");
});

// Kustuta toode
router.delete("/:id", middleware.checkIpSessionValid, async (req, res, next) => {
    if (await sqlFun.deleteToode(req, next) === -1) return;
        
    req.flash("SUCCESS3", "Toode sai kustutatud.", "/admin/tooted");
});

module.exports = router;